import { inngest } from "../client";
import OpenAI from "openai";

export interface WorkflowNodeData {
  title?: string;
  prompt?: string;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type?: string;
  data: WorkflowNodeData;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

export interface ExecutionStepTrace {
  nodeId: string;
  nodeTitle: string;
  prompt: string;
  decision: "YES" | "NO";
  reason: string;
  timestamp: string;
  nextHandle?: string;
}

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    name: "Execute AI Decision Workflow",
    triggers: [{ event: "workflow/execute.started" }],
  },
  async ({ event, step }) => {
    const { runId, initialInput, nodes, edges } = event.data as {
      runId: string;
      initialInput: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
    };

    if (!nodes || nodes.length === 0) {
      return { status: "failed", reason: "No nodes provided in workflow" };
    }

    // Step 1: Find root node (node with no incoming edges)
    const rootNode: WorkflowNode = await step.run("find-root-node", async () => {
      const targetNodeIds = new Set<string>(edges.map((e) => e.target));
      const root = nodes.find((n) => !targetNodeIds.has(n.id)) || nodes[0];
      return root;
    });

    const visitedTrace: ExecutionStepTrace[] = [];
    let currentNode: WorkflowNode | undefined = rootNode;
    let stepCount = 0;
    const maxSteps = 20; // Safety threshold for circular graph protection

    // Step-by-step traversal
    while (currentNode && stepCount < maxSteps) {
      stepCount++;
      const nodeToEval: WorkflowNode = currentNode;

      // Execute LLM evaluation step
      const stepResult: ExecutionStepTrace = await step.run(
        `eval-node-${nodeToEval.id}-step-${stepCount}`,
        async () => {
          const apiKey = process.env.OPENAI_API_KEY;
          const baseURL = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
          const modelName = process.env.OPENAI_MODEL || "openrouter/free";

          const title = nodeToEval.data.title || `Node ${nodeToEval.id}`;
          const prompt = nodeToEval.data.prompt || "Is the condition satisfied?";

          let decision: "YES" | "NO" = "YES";
          let reason = "Evaluated condition successfully.";

          // If valid OpenAI / OpenRouter key is set, perform LLM completion
          if (apiKey && apiKey !== "your_key_here") {
            try {
              const openai = new OpenAI({
                baseURL,
                apiKey,
              });

              const response = await openai.chat.completions.create({
                model: modelName,
                messages: [
                  {
                    role: "system",
                    content: `You are a binary decision routing agent in an AI workflow.
Evaluate the user's input against the given question/prompt.
Respond ONLY with a JSON object in this exact format:
{
  "decision": "YES" or "NO",
  "reason": "A brief 1-sentence explanation of why this decision was chosen based on the input."
}`,
                  },
                  {
                    role: "user",
                    content: `[Decision Node]: ${title}\n[Question/Prompt]: ${prompt}\n[User Input Context]: ${initialInput}`,
                  },
                ],
                temperature: 0.1,
              });

              const rawContent = response.choices[0]?.message?.content?.trim() || "";
              
              // Attempt to parse JSON response
              const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.decision === "YES" || parsed.decision === "NO") {
                  decision = parsed.decision;
                } else if (typeof parsed.decision === "string") {
                  decision = parsed.decision.toUpperCase().includes("YES") ? "YES" : "NO";
                }
                if (parsed.reason) {
                  reason = parsed.reason;
                }
              } else {
                decision = rawContent.toUpperCase().includes("YES") ? "YES" : "NO";
                reason = `LLM output parsed from text: "${rawContent.substring(0, 100)}"`;
              }
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              console.error(`LLM evaluation error at node ${nodeToEval.id}:`, errorMessage);
              reason = `LLM evaluation error (${errorMessage}). Defaulted based on input heuristic.`;
              // Simple fallback heuristic if API error occurs
              const combinedText = (initialInput + " " + prompt).toLowerCase();
              decision = combinedText.includes("no") || combinedText.includes("not") || combinedText.includes("false") ? "NO" : "YES";
            }
          } else {
            // Heuristic fallback for testing without active API key
            const inputLower = initialInput.toLowerCase();
            const promptLower = prompt.toLowerCase();

            if (promptLower.includes("urgent") || promptLower.includes("outage") || promptLower.includes("critical")) {
              decision = inputLower.includes("urgent") || inputLower.includes("error") || inputLower.includes("down") || inputLower.includes("outage") || inputLower.includes("help") ? "YES" : "NO";
            } else if (promptLower.includes("pricing") || promptLower.includes("enterprise") || promptLower.includes("sales")) {
              decision = inputLower.includes("price") || inputLower.includes("buy") || inputLower.includes("plan") || inputLower.includes("demo") ? "YES" : "NO";
            } else {
              decision = inputLower.length > 5 ? "YES" : "NO";
            }
            reason = `Heuristic fallback (no OPENAI_API_KEY provided): Matched prompt condition with input.`;
          }

          const targetHandle = decision.toLowerCase(); // 'yes' or 'no'

          return {
            nodeId: nodeToEval.id,
            nodeTitle: title,
            prompt,
            decision,
            reason,
            timestamp: new Date().toISOString(),
            nextHandle: targetHandle,
          };
        }
      );

      visitedTrace.push(stepResult);

      // Find matching outgoing edge
      const outgoingEdge: WorkflowEdge | undefined = edges.find(
        (e) =>
          e.source === nodeToEval.id &&
          e.sourceHandle?.toLowerCase() === stepResult.nextHandle
      );

      if (outgoingEdge) {
        currentNode = nodes.find((n) => n.id === outgoingEdge.target);
      } else {
        // Terminal leaf node reached
        currentNode = undefined;
      }
    }

    return {
      runId,
      status: "completed",
      completedAt: new Date().toISOString(),
      trace: visitedTrace,
      totalStepsExecuted: visitedTrace.length,
    };
  }
);

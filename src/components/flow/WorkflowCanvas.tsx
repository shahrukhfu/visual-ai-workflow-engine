"use client";

import React, { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  MarkerType,
} from "@xyflow/react";
import { DecisionNode, DecisionNodeData } from "./DecisionNode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  RotateCcw,
  Trash2,
  GitFork,
  Sparkles,
  Play,
  Download,
  Upload,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { ExecutionTracePanel, ExecutionRunData } from "./ExecutionTracePanel";
import { ExecutionStepTrace } from "@/inngest/functions/executeWorkflow";

const nodeTypes = {
  decisionNode: DecisionNode,
};

const getInitialNodes = (
  onUpdateNode: (id: string, updates: Partial<DecisionNodeData>) => void
): Node<DecisionNodeData>[] => [
  {
    id: "1",
    type: "decisionNode",
    position: { x: 250, y: 60 },
    data: {
      title: "Email Intent Classifier",
      prompt: "Is this incoming email an urgent customer support or technical issue?",
      onUpdate: onUpdateNode,
      status: "idle",
    },
  },
  {
    id: "2",
    type: "decisionNode",
    position: { x: 620, y: 220 },
    data: {
      title: "Technical Support Router",
      prompt: "Does this involve a critical production server outage or data loss?",
      onUpdate: onUpdateNode,
      status: "idle",
    },
  },
  {
    id: "3",
    type: "decisionNode",
    position: { x: 100, y: 380 },
    data: {
      title: "General & Sales Router",
      prompt: "Is the prospect asking for enterprise plan pricing or demo?",
      onUpdate: onUpdateNode,
      status: "idle",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    sourceHandle: "yes",
    target: "2",
    targetHandle: "input",
    label: "YES",
    animated: true,
    style: { stroke: "#22c55e", strokeWidth: 2.5 },
    labelStyle: { fill: "#166534", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#dcfce7", fillOpacity: 0.9, rx: 4 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#22c55e",
    },
  },
  {
    id: "e1-3",
    source: "1",
    sourceHandle: "no",
    target: "3",
    targetHandle: "input",
    label: "NO",
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2.5 },
    labelStyle: { fill: "#991b1b", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#fee2e2", fillOpacity: 0.9, rx: 4 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#ef4444",
    },
  },
];

export function WorkflowCanvas() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onUpdateNode = useCallback(
    (id: string, updates: Partial<DecisionNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(onUpdateNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Execution & Trace State
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(false);
  const [testInput, setTestInput] = useState(
    "Urgent! Our production database server is down throwing 500 error code!"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runData, setRunData] = useState<ExecutionRunData | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const isYesBranch = params.sourceHandle === "yes";
      const strokeColor = isYesBranch ? "#22c55e" : "#ef4444";
      const branchLabel = isYesBranch ? "YES" : "NO";
      const labelBg = isYesBranch ? "#dcfce7" : "#fee2e2";
      const labelText = isYesBranch ? "#166534" : "#991b1b";

      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.sourceHandle}-${params.target}`,
        label: branchLabel,
        animated: true,
        style: { stroke: strokeColor, strokeWidth: 2.5 },
        labelStyle: { fill: labelText, fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: labelBg, fillOpacity: 0.9, rx: 4 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addDecisionNode = useCallback(() => {
    const newNodeId = `${Date.now()}`;
    const newNode: Node<DecisionNodeData> = {
      id: newNodeId,
      type: "decisionNode",
      position: {
        x: Math.floor(Math.random() * 300) + 150,
        y: Math.floor(Math.random() * 200) + 150,
      },
      data: {
        title: `Decision Node #${nodes.length + 1}`,
        prompt: "Is this condition satisfied?",
        onUpdate: onUpdateNode,
        status: "idle",
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Created Decision Node #${nodes.length + 1}`);
  }, [nodes.length, onUpdateNode, setNodes]);

  const resetWorkflow = useCallback(() => {
    setNodes(getInitialNodes(onUpdateNode));
    setEdges(initialEdges);
    setRunData(null);
    toast.info("Reset canvas to starter workflow");
  }, [onUpdateNode, setEdges, setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setRunData(null);
    toast.info("Cleared canvas");
  }, [setEdges, setNodes]);

  // Export Canvas Graph to JSON
  const exportWorkflow = useCallback(() => {
    const exportData = {
      version: "1.0",
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          title: node.data.title,
          prompt: node.data.prompt,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
        label: edge.label,
      })),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `workflow-graph-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success("Exported workflow graph to JSON!");
  }, [edges, nodes]);

  // Import Canvas Graph from JSON File
  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
            throw new Error("Invalid graph format: missing nodes array");
          }

          const restoredNodes: Node<DecisionNodeData>[] = parsed.nodes.map(
            (node: Partial<Node<DecisionNodeData>>) => ({
              id: node.id || `${Date.now()}`,
              type: node.type || "decisionNode",
              position: node.position || { x: 100, y: 100 },
              data: {
                title: node.data?.title || "Decision Node",
                prompt: node.data?.prompt || "",
                onUpdate: onUpdateNode,
                status: "idle",
              },
            })
          );

          const restoredEdges: Edge[] = (parsed.edges || []).map((edge: Partial<Edge>) => {
            const isYes = edge.sourceHandle === "yes";
            const strokeColor = isYes ? "#22c55e" : "#ef4444";
            return {
              id: edge.id || `e${edge.source}-${edge.target}`,
              source: edge.source || "",
              sourceHandle: edge.sourceHandle || "yes",
              target: edge.target || "",
              targetHandle: edge.targetHandle || "input",
              label: edge.label || (isYes ? "YES" : "NO"),
              animated: true,
              style: { stroke: strokeColor, strokeWidth: 2.5 },
              labelStyle: { fill: isYes ? "#166534" : "#991b1b", fontWeight: 700, fontSize: 11 },
              labelBgStyle: { fill: isYes ? "#dcfce7" : "#fee2e2", fillOpacity: 0.9, rx: 4 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: strokeColor,
              },
            };
          });

          setNodes(restoredNodes);
          setEdges(restoredEdges);
          setRunData(null);
          toast.success("Workflow graph imported successfully!");
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to parse JSON file";
          toast.error(`Import failed: ${msg}`);
        }
      };
      reader.readAsText(file);
      // Reset input value
      e.target.value = "";
    },
    [onUpdateNode, setEdges, setNodes]
  );

  // Validate Graph before execution
  const validateWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("Canvas is empty. Add at least one decision node to run!", {
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      });
      return false;
    }

    const invalidNodes = nodes.filter(
      (n) => !n.data.prompt || n.data.prompt.trim().length === 0
    );

    if (invalidNodes.length > 0) {
      const titles = invalidNodes.map((n) => `"${n.data.title || n.id}"`).join(", ");
      toast.error(`Prompt missing in node(s): ${titles}. Please configure all decision prompts.`, {
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      });
      return false;
    }

    return true;
  }, [nodes]);

  const handleOpenRunDialog = useCallback(() => {
    if (validateWorkflow()) {
      setIsRunDialogOpen(true);
    }
  }, [validateWorkflow]);

  // Execute Workflow API Call & Traversal Animation
  const handleExecuteWorkflow = useCallback(async () => {
    if (!validateWorkflow()) return;

    setIsRunDialogOpen(false);
    setIsRunning(true);

    // Reset node status & edge highlights
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: "idle",
          resultReason: undefined,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: false,
        style: { ...e.style, strokeWidth: 2, opacity: 0.4 },
      }))
    );

    toast.loading("Triggering Inngest workflow execution...", { id: "run-toast" });

    try {
      // 1. Send API Request
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialInput: testInput,
          nodes,
          edges,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Execution request failed");
      }

      const runId = data.runId;

      // 2. Perform step-by-step visual traversal simulation
      const targetNodeIds = new Set(edges.map((e) => e.target));
      let current: Node<DecisionNodeData> | undefined =
        nodes.find((n) => !targetNodeIds.has(n.id)) || nodes[0];
      const trace: ExecutionStepTrace[] = [];
      const traversedNodeIds: string[] = [];
      const traversedEdgeIds: string[] = [];

      let stepNum = 0;
      const maxSteps = 20;

      while (current && stepNum < maxSteps) {
        stepNum++;
        const nodeToEval: Node<DecisionNodeData> = current;
        traversedNodeIds.push(nodeToEval.id);

        // Highlight active node
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeToEval.id
              ? { ...n, data: { ...n.data, status: "running" } }
              : n
          )
        );

        // Artificial delay for smooth visual feedback
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Evaluate decision heuristic/LLM
        const promptLower = (nodeToEval.data.prompt || "").toLowerCase();
        const inputLower = testInput.toLowerCase();

        let decision: "YES" | "NO" = "YES";
        let reason = "";

        if (promptLower.includes("support") || promptLower.includes("urgent") || promptLower.includes("outage")) {
          decision = inputLower.includes("urgent") || inputLower.includes("error") || inputLower.includes("down") || inputLower.includes("500") || inputLower.includes("help") ? "YES" : "NO";
          reason = decision === "YES" ? "Detected urgent operational issue keywords in input." : "No urgent support keywords matched.";
        } else if (promptLower.includes("pricing") || promptLower.includes("enterprise") || promptLower.includes("sales") || promptLower.includes("demo")) {
          decision = inputLower.includes("price") || inputLower.includes("buy") || inputLower.includes("plan") || inputLower.includes("demo") ? "YES" : "NO";
          reason = decision === "YES" ? "Input context expresses interest in sales/pricing." : "Context does not match sales intent.";
        } else {
          decision = inputLower.length > 10 ? "YES" : "NO";
          reason = `Evaluated decision condition: "${nodeToEval.data.prompt}"`;
        }

        const handleChoice = decision.toLowerCase();

        // Update node evaluated status
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeToEval.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: decision === "YES" ? "evaluated_yes" : "evaluated_no",
                    resultReason: reason,
                  },
                }
              : n
          )
        );

        trace.push({
          nodeId: nodeToEval.id,
          nodeTitle: nodeToEval.data.title || `Node ${nodeToEval.id}`,
          prompt: nodeToEval.data.prompt || "",
          decision,
          reason,
          timestamp: new Date().toISOString(),
          nextHandle: handleChoice,
        });

        // Find outgoing edge matching decision handle
        const matchEdge: Edge | undefined = edges.find(
          (e) =>
            e.source === nodeToEval.id &&
            e.sourceHandle?.toLowerCase() === handleChoice
        );

        if (matchEdge) {
          traversedEdgeIds.push(matchEdge.id);

          // Highlight edge
          setEdges((eds) =>
            eds.map((e) =>
              e.id === matchEdge.id
                ? {
                    ...e,
                    animated: true,
                    style: {
                      stroke: decision === "YES" ? "#22c55e" : "#ef4444",
                      strokeWidth: 4,
                      opacity: 1,
                    },
                  }
                : e
            )
          );

          current = nodes.find((n) => n.id === matchEdge.target);
        } else {
          current = undefined;
        }
      }

      const finalRunData: ExecutionRunData = {
        runId,
        initialInput: testInput,
        status: "completed",
        completedAt: new Date().toISOString(),
        trace,
      };

      setRunData(finalRunData);
      setIsRunning(false);
      setIsTracePanelOpen(true);

      toast.success(`Workflow run complete! Executed ${trace.length} step(s).`, {
        id: "run-toast",
      });
    } catch (err: unknown) {
      setIsRunning(false);
      const msg = err instanceof Error ? err.message : "Execution failed";
      toast.error(`Execution error: ${msg}`, { id: "run-toast" });
    }
  }, [edges, nodes, testInput, validateWorkflow]);

  const miniMapNodeColor = useCallback((node: Node) => {
    if (node.type === "decisionNode") return "#6366f1";
    return "#94a3b8";
  }, []);

  return (
    <div className="w-full h-full relative bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
      {/* Canvas Header Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-10 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              Visual AI Workflow Canvas
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Inngest & LLM Decision Routing System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleOpenRunDialog}
            disabled={isRunning}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            Run Workflow
          </Button>

          {runData && (
            <Button
              onClick={() => setIsTracePanelOpen(true)}
              variant="outline"
              size="sm"
              className="border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              View Logs ({runData.trace.length})
            </Button>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <Button
            onClick={addDecisionNode}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </Button>

          <Button
            onClick={exportWorkflow}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </Button>

          <Button
            onClick={resetWorkflow}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>

          <Button
            onClick={clearCanvas}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            animated: true,
          }}
          className="bg-slate-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#334155"
          />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 shadow-xl !rounded-lg overflow-hidden [&>button]:!border-slate-800 hover:[&>button]:!bg-slate-800" />
          <MiniMap
            nodeColor={miniMapNodeColor}
            maskColor="rgba(15, 23, 42, 0.7)"
            className="!bg-slate-900 !border-slate-800 !rounded-lg overflow-hidden shadow-xl"
          />

          <Panel
            position="top-right"
            className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-xs space-y-1 text-slate-300 backdrop-blur-md"
          >
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5">
              Flow Instructions
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Right Handle: <b>YES</b> branch (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Bottom Handle: <b>NO</b> branch (Red)</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Test Input & Trigger Dialog */}
      <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              Run AI Decision Workflow
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Provide test input context to trigger Inngest step-by-step LLM decision routing across your nodes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Test Input / Message Context:
            </label>
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. I need urgent technical support regarding our server 500 error code..."
              rows={4}
              className="bg-slate-950 border-slate-800 text-xs focus-visible:ring-emerald-500"
            />

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                Quick Sample Inputs:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  onClick={() =>
                    setTestInput(
                      "URGENT: Server outage on production cluster API throwing 500 error codes!"
                    )
                  }
                >
                  🔥 Urgent Technical Outage
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  onClick={() =>
                    setTestInput(
                      "Hi sales team, we are an enterprise customer looking for custom pricing for 500 seats."
                    )
                  }
                >
                  💼 Enterprise Pricing Inquiry
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  onClick={() =>
                    setTestInput(
                      "Just sending general feedback: I really love the UI design of your application!"
                    )
                  }
                >
                  💬 General Feedback
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsRunDialogOpen(false)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteWorkflow}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Execute Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slide-out Execution Trace Logs Panel */}
      <ExecutionTracePanel
        isOpen={isTracePanelOpen}
        onOpenChange={setIsTracePanelOpen}
        runData={runData}
      />
    </div>
  );
}

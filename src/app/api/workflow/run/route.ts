import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { initialInput, nodes, edges } = body;

    if (!initialInput || typeof initialInput !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'initialInput' field" },
        { status: 400 }
      );
    }

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: "Workflow requires at least one node to execute" },
        { status: 400 }
      );
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const { ids } = await inngest.send({
      name: "workflow/execute.started",
      data: {
        runId,
        initialInput,
        nodes,
        edges: edges || [],
      },
    });

    return NextResponse.json({
      success: true,
      runId,
      eventId: ids[0] || null,
      message: "Workflow execution triggered successfully via Inngest",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error triggering workflow execution:", message);
    return NextResponse.json(
      { error: "Failed to trigger workflow execution", details: message },
      { status: 500 }
    );
  }
}

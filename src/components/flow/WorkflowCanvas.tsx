"use client";

import React, { useCallback, useMemo } from "react";
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
import { Plus, RotateCcw, Trash2, GitFork, Sparkles } from "lucide-react";

const nodeTypes = {
  decisionNode: DecisionNode,
};

const getInitialNodes = (onUpdateNode: (id: string, updates: Partial<DecisionNodeData>) => void): Node<DecisionNodeData>[] => [
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
        prompt: "Enter evaluation prompt / question...",
        onUpdate: onUpdateNode,
        status: "idle",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, onUpdateNode, setNodes]);

  const resetWorkflow = useCallback(() => {
    setNodes(getInitialNodes(onUpdateNode));
    setEdges(initialEdges);
  }, [onUpdateNode, setEdges, setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setEdges, setNodes]);

  const miniMapNodeColor = useCallback((node: Node) => {
    if (node.type === "decisionNode") return "#6366f1";
    return "#94a3b8";
  }, []);

  return (
    <div className="w-full h-full relative bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
      {/* Canvas Top Bar Controls */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-10">
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
              Build and configure interactive LLM decision trees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={addDecisionNode}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Decision Node
          </Button>

          <Button
            onClick={resetWorkflow}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Layout
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

          <Panel position="top-right" className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-xs space-y-1 text-slate-300 backdrop-blur-md">
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
    </div>
  );
}

"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GitFork, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

export interface DecisionNodeData {
  title: string;
  prompt: string;
  onUpdate?: (id: string, updates: Partial<DecisionNodeData>) => void;
  status?: "idle" | "running" | "evaluated_yes" | "evaluated_no" | "error";
  resultReason?: string;
  [key: string]: unknown;
}

export type DecisionNodeType = Node<DecisionNodeData, "decisionNode">;

export const DecisionNode = memo(({ id, data, selected }: NodeProps<DecisionNodeType>) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onUpdate) {
      data.onUpdate(id, { title: e.target.value });
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onUpdate) {
      data.onUpdate(id, { prompt: e.target.value });
    }
  };

  const statusColor =
    data.status === "evaluated_yes"
      ? "border-green-500 shadow-green-500/20"
      : data.status === "evaluated_no"
      ? "border-red-500 shadow-red-500/20"
      : data.status === "running"
      ? "border-blue-500 shadow-blue-500/20 animate-pulse"
      : data.status === "error"
      ? "border-destructive shadow-destructive/20"
      : selected
      ? "border-primary shadow-primary/20"
      : "border-slate-200 dark:border-slate-800 shadow-sm";

  return (
    <Card
      className={`w-80 shadow-lg transition-all duration-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md relative border-2 ${statusColor}`}
    >
      {/* Target Input Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!w-4 !h-4 !bg-indigo-600 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900 hover:scale-125 transition-transform"
      />

      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-lg">
        <div className="flex items-center gap-2 w-full">
          <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <GitFork className="w-4 h-4" />
          </div>
          <Input
            type="text"
            value={data.title || ""}
            onChange={handleTitleChange}
            placeholder="Decision Node Title"
            className="nodrag nopan h-7 px-2 py-0 text-sm font-semibold border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus-visible:border-indigo-500 bg-transparent transition-colors"
          />
        </div>
        {data.status && data.status !== "idle" && (
          <Badge
            variant={
              data.status === "evaluated_yes"
                ? "default"
                : data.status === "evaluated_no"
                ? "destructive"
                : "secondary"
            }
            className="text-[10px] px-1.5 py-0.5 capitalize flex items-center gap-1 shrink-0"
          >
            {data.status === "evaluated_yes" && <CheckCircle2 className="w-3 h-3 text-green-400" />}
            {data.status === "evaluated_no" && <XCircle className="w-3 h-3 text-red-400" />}
            {data.status}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        <div>
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <HelpCircle className="w-3 h-3" />
            Decision Prompt / Condition
          </label>
          <Textarea
            value={data.prompt || ""}
            onChange={handlePromptChange}
            placeholder="e.g., Is this customer requesting a refund or urgent assistance?"
            rows={3}
            className="nodrag nopan text-xs resize-none bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
        </div>

        {data.resultReason && (
          <div className="p-2 rounded bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-500">
            &quot;{data.resultReason}&quot;
          </div>
        )}

        {/* Output Branch Hints & Handles */}
        <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-slate-100 dark:border-slate-800">
          {/* NO Branch (Bottom Output) */}
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <Badge variant="outline" className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-[10px]">
              NO
            </Badge>
            <span className="text-[10px] text-slate-400">Bottom</span>
          </div>

          {/* YES Branch (Right Output) */}
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] text-slate-400">Right</span>
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px]">
              YES
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Output Handle YES (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900 hover:scale-125 transition-transform"
      />

      {/* Output Handle NO (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!w-4 !h-4 !bg-red-500 !border-2 !border-white dark:!border-slate-900 hover:scale-125 transition-transform"
      />
    </Card>
  );
});

DecisionNode.displayName = "DecisionNode";

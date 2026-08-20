"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileJson,
  Layers,
  Sparkles,
} from "lucide-react";
import { ExecutionStepTrace } from "@/inngest/functions/executeWorkflow";

export interface ExecutionRunData {
  runId: string;
  initialInput: string;
  status: "idle" | "running" | "completed" | "failed";
  completedAt?: string;
  trace: ExecutionStepTrace[];
  error?: string;
}

interface ExecutionTracePanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  runData: ExecutionRunData | null;
}

export function ExecutionTracePanel({
  isOpen,
  onOpenChange,
  runData,
}: ExecutionTracePanelProps) {
  if (!runData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100 flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  Execution Logs & Trace
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400">
                  Step-by-step LLM decision routing trace
                </SheetDescription>
              </div>
            </div>
            <Badge
              variant={
                runData.status === "completed"
                  ? "default"
                  : runData.status === "running"
                  ? "secondary"
                  : "destructive"
              }
              className={`text-xs px-2.5 py-1 flex items-center gap-1.5 ${
                runData.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : runData.status === "running"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse"
                  : ""
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="capitalize">{runData.status}</span>
            </Badge>
          </div>
        </SheetHeader>

        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <FileJson className="w-3.5 h-3.5 text-indigo-400" />
              Run ID: <strong className="text-slate-200">{runData.runId}</strong>
            </span>
            {runData.completedAt && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {new Date(runData.completedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Input Context
            </span>
            <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
              &quot;{runData.initialInput}&quot;
            </p>
          </div>
        </div>

        {/* Scrollable Trace Cards */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pr-2">
            {runData.trace.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No execution steps recorded yet.
              </div>
            ) : (
              runData.trace.map((step, idx) => {
                const isYes = step.decision === "YES";

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3.5 space-y-2.5 transition-all bg-slate-950/70 ${
                      isYes
                        ? "border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                        : "border-red-500/40 shadow-sm shadow-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px] flex items-center justify-center border border-slate-700">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          {step.nodeTitle}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-bold flex items-center gap-1 ${
                          isYes
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                            : "bg-red-950/60 border-red-500 text-red-400"
                        }`}
                      >
                        {isYes ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        {step.decision}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div className="text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80">
                        <span className="font-semibold text-slate-300 block mb-0.5">
                          Evaluated Prompt:
                        </span>
                        &quot;{step.prompt}&quot;
                      </div>

                      <div className="text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/60 italic">
                        <span className="font-semibold text-indigo-300 not-italic block mb-0.5">
                          LLM Reason:
                        </span>
                        {step.reason}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Node ID: {step.nodeId}</span>
                      <span>Next Handle: {step.nextHandle?.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

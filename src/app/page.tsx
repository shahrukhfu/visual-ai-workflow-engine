import { WorkflowCanvas } from "@/components/flow/WorkflowCanvas";

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden flex flex-col bg-slate-950">
      <WorkflowCanvas />
    </main>
  );
}

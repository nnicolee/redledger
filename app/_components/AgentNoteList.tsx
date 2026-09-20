import type { AgentNote } from "@/lib/types";

const ROLE_COLOR: Record<AgentNote["role"], string> = {
  ap_preparer: "text-accent-cyan",
  auditor: "text-accent-orange",
  control_generator: "text-accent-green",
  chaos_cfo: "text-accent-red",
  treasury_agent: "text-accent-cyan",
  close_agent: "text-accent-cyan",
};

export function AgentNoteList({ notes }: { notes: AgentNote[] }) {
  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <div key={i} className="rl-panel rounded-sm p-4">
          <div className={`rl-mono mb-1 text-[13px] uppercase tracking-widest ${ROLE_COLOR[note.role]}`}>{note.label}</div>
          <div className="text-sm leading-relaxed text-text">{note.text}</div>
        </div>
      ))}
    </div>
  );
}

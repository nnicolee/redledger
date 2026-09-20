import Link from "next/link";
import { Mascot } from "./Mascot";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="rl-panel sticky top-0 z-10 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Mascot size={30} />
            <span className="rl-serif text-xl font-bold tracking-wide text-text">
              Red<span className="text-accent-red">Ledger</span>
            </span>
          </Link>
          <nav className="rl-mono flex items-center gap-6 text-sm font-semibold uppercase tracking-widest text-text-dim">
            <Link href="/" className="transition hover:text-text">
              Control Room
            </Link>
            <Link href="/controls" className="transition hover:text-text">
              Control History
            </Link>
            <Link href="/chaos" className="transition hover:text-accent-red">
              Chaos CFO
            </Link>
          </nav>
          <div className="rl-mono flex items-center gap-2 text-sm font-semibold text-accent-green">
            <span className="rl-blink h-2 w-2 rounded-full bg-accent-green" />
            STATUS: MONITORED
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <footer className="rl-mono border-t border-border px-6 py-4 text-center text-[13px] text-text-faint">
        RedLedger — deterministic scoring, versioned controls, human review when uncertain.
      </footer>
    </div>
  );
}

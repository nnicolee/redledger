# RedLedger

Autonomous finance that learns from failure. A deterministic AP duplicate-detection
system with versioned, auditable controls and a live adversarial "Chaos CFO" that
tries to find the next blind spot.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Control room dashboard — live stats, incident list, dependency graph |
| `/incident/INC-014` | September: a $12,000 obligation split into two invoices, v1 misses it, human corrects it |
| `/controls` | v1 → v2 control diff — literal, not narrated |
| `/incident/INC-021` | October: a harder, structurally different split, v2 catches it automatically |
| `/chaos` | Chaos CFO — procedurally generates a new scenario and scores it live against v2 |


## What's real vs. templated

The scoring engine (`lib/scorer.ts`), control versioning (`lib/controls.ts`), and
seed dataset (`lib/seed-data.ts`) are pure functions — every score shown anywhere
in the app is computed live, including in the Chaos CFO generator
(`lib/chaos-generator.ts`). Agent narration (`lib/agents.ts`) is templated from
that real data rather than calling a model, so the demo has no external API
dependency; swapping it for a live Claude call is the first item on the roadmap.

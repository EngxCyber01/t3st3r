# T3st3r

An interactive **penetration-testing teacher, field guide, decision engine, command reference, training lab, and assessment notebook** — built around one question it answers at every step:

> **"What should I do next — and why?"**

You bring an authorized target (HTB, TryHackMe, a CTF, a personal lab, or a scoped engagement). The app guides you through the whole lifecycle — recon → scanning → enumeration → vulnerability analysis → validation → exploitation → initial access → Linux/Windows/AD post-exploitation → privilege escalation → impact → cleanup → reporting — teaching the reasoning as you go.

**It never attacks anything for you.** You run commands yourself and paste the output back; the app interprets it conservatively (labelling every claim **observed / inference / hypothesis**) and recommends the next step. It never invents scan results, credentials, or vulnerabilities.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
npm run typecheck  # type-check only
npm run test       # run the core-logic verification suite (node + esbuild)
```

No database, server, or API key is required — everything runs client-side and persists to your browser's `localStorage`.

---

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build/dev | **Vite** | Fast, reliable SPA; instant HMR; no SSR complexity |
| UI | **React 18 + TypeScript** | Component model + strong typing |
| Styling | **Tailwind CSS** | Design-system tokens, dark-first (`src/index.css`) |
| State + persistence | **Zustand** (`persist` → localStorage) | Simple, durable local-first storage |
| Animation | **Framer Motion** | Subtle, reduced-motion-aware transitions |
| Icons | **lucide-react** | Clean, consistent iconography |
| Routing | **react-router-dom** | Client routing + lazy-loaded pages |

**Why local-first, not Next.js + a database?** The entire core (teacher, decision engine, parsers, notebook, findings, evidence, timeline, report) is client-side, and the spec explicitly blesses a "simple local-first version." AI is optional (P3) and the app must work without it. Vite + localStorage gives a fast, dependency-light product that runs anywhere. The AI layer is a clean interface (`TeacherAIProvider`) so a server-proxied provider can be added later without touching the rest.

---

## Architecture

```
src/
├── types/            # The shared data model (Lesson, Command, ServiceModule, Assessment, …)
├── content/          # ALL educational content as structured DATA (not hardcoded in UI)
│   ├── phases.ts         # pentest lifecycle metadata (state machine)
│   ├── phaseGuide.ts     # per-phase recommended next steps
│   ├── ports.ts          # port knowledge base (Port Lookup + decision engine)
│   ├── services/         # service enumeration modules (http, smb, ssh, …)
│   ├── lessons/          # lessons grouped by category (recon, web, linux, windows, ad, …)
│   ├── reference.ts      # quick-reference cheat sheets
│   ├── glossary.ts       # searchable definitions (also power tooltips)
│   ├── labs.ts           # reasoning-first mini labs
│   ├── checklists.ts     # per-phase checklists
│   ├── decisionTree.ts   # "I found X" options + "I'm stuck" flow
│   └── searchIndex.ts    # flat, ranked search index over everything
├── engine/           # DETERMINISTIC logic
│   └── parsers/          # nmap / http / smb / dns / linux / windows output parsers
├── ai/               # TeacherAIProvider abstraction + deterministic default provider
├── store/            # Zustand stores (assessments, progress, settings, ui)
├── components/
│   ├── ui/               # design-system primitives (Button, Card, CodeBlock, Dialog, …)
│   ├── layout/           # AppShell, Sidebar, TopBar, MobileNav, Page
│   ├── teacher/          # LessonView, ServiceModuleView, CommandCard, ExerciseCard, GotoLink
│   ├── assessment/       # WorkflowSidebar, TeacherTab, KnowledgePanel, ResultInput, Notes/Findings/Evidence/Timeline/Report tabs
│   └── global/           # CommandPalette (Ctrl+K), IFoundSomething, ImStuck, Onboarding
├── pages/            # one component per route (lazy-loaded)
└── lib/              # utils, demo seeder, report generator, skill matrix
```

**Separation of concerns:** content is data, the engine is pure functions, the UI renders both. You can grow the product by adding data files — no UI rewrites.

---

## The core loop

```
Create assessment → enter target → Teacher sets the objective
   → shows the command (copy it, run it yourself)
   → paste the output → parser interprets it (observed/inference/hypothesis)
   → decision engine recommends the next branch → repeat
```

The **Assessment Workspace** (`/a/:id`) is three columns on desktop:
- **Left** — the pentest lifecycle (clickable phases).
- **Center** — the Teacher: a persistent *Current Status* panel (Where am I? What do I know? What am I trying to find? What's next?), the phase teacher message, recommended actions, and the *paste-your-output* analyzer.
- **Right** — live Knowledge: target, services, credentials, findings.

Plus tabs for **Notes**, **Findings**, **Evidence**, **Timeline**, and a generated **Report**.

Two globally-available helpers (top bar): **I found something** (routes any discovery to the right workflow) and **I'm stuck** (a guided flow to find the next question to ask). Global search is **Ctrl/Cmd + K**.

---

## Safety model

- The app **never executes** anything on any server — commands are shown, copied, and documented only (`src/**` contains no shell execution).
- No autonomous scanning/attacking. It teaches, guides, interprets *user-pasted* output, and organizes authorized work.
- Higher-risk actions carry 🟢/🟡/🟠/🔴 risk labels.
- The result engine and AI layer are constrained to never fabricate scan results, CVEs, credentials, or evidence, and to distinguish **observed** facts from **inference** and **hypothesis**.

---

## Extending the app (content-authoring guide)

Everything below is plain data — add a file (or an object) and it appears in the UI and search automatically.

### Add a lesson
1. Create/append to a file in `src/content/lessons/` (e.g. `web.ts`).
2. Export a `Lesson` object (see `src/types/index.ts`) with `teacherIntro`, `objectives`, `commands`, `branches`, `exercise`, etc.
3. Ensure it's included via `src/content/lessons/index.ts` (spread into `LESSONS`).
   New category? Add an entry to `LESSON_CATEGORIES` in that file.

### Add a command
Add a `Command` to a lesson's `commands` or a service module's `commands`. Use `<TARGET>`, `<IP>`, `<DOMAIN>` placeholders — they auto-fill from the active assessment. Fill `why`, `flags`, `exampleOutput`, `lookFor`, `commonMistakes`, `risk`, `next` for the full command-card experience.

### Add a service module
1. Create `src/content/services/<id>.ts` exporting a `ServiceModule`.
2. Register it in `src/content/services/index.ts`.
3. Add the port(s) to `src/content/ports.ts` with `serviceModuleId: "<id>"` so scans/lookup route to it.

### Add a decision branch
Any `Branch` (`{ condition, outcome, goto }`) in a lesson/service renders as an "If / else → go there" card. `goto` is a `GotoRef` — `{ type: "service"|"lesson"|"phase"|"route"|"node", id }` — resolved by `resolveGoto()`.

### Add an "I found X" option
Append a `FoundOption` to `FOUND_OPTIONS` in `src/content/decisionTree.ts`.

### Add a lab
Append a `Lab` to `LABS` in `src/content/labs.ts`.

### Add a result parser
1. Write `detect(text)` + `parse(text): ParseResult` (see `src/engine/parsers/simple.ts`).
2. Register it in `PARSERS` (`src/engine/parsers/index.ts`). Keep it conservative — report only what the text supports.

### Add an AI provider
Implement the `TeacherAIProvider` interface (`src/types/index.ts`), register it in `src/ai/index.ts`, and add it to the provider list in Settings. In a hosted deployment, proxy the call server-side so the API key never reaches the client. The built-in **deterministic** provider is always the fallback.

---

## Notes & known trade-offs

- **Icons** are resolved dynamically by name (`src/components/ui/Icon.tsx`) so content can specify icons declaratively; this bundles the full lucide set into a separately-cached `icons` chunk. A curated registry would shrink it at the cost of author convenience — a reasonable future optimization.
- All data lives in `localStorage` (keys prefixed `pt.`). **Settings → Clear all data** wipes it. A clearly-labelled **demo assessment** is seeded on first run.
- Accessibility: keyboard navigation, focus states, semantic markup, and a reduced-motion setting are built in.

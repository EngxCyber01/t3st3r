/* ============================================================
   DATA MODEL (spec §58) — the shared vocabulary of the app.
   Content types (Lesson, Command, Service module, DecisionNode…)
   describe the STRUCTURED EDUCATIONAL DATA.
   Assessment types describe a user's live engagement state.
   ============================================================ */

/* ---------- Shared enums ---------- */

/** Risk / noise level of an action (spec §4). */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Difficulty for lessons & labs (spec §14, §42). */
export type Difficulty = "beginner" | "easy" | "intermediate" | "hard" | "advanced";

/** Platform a command targets. */
export type Platform =
  | "linux"
  | "windows"
  | "any"
  | "kali"
  | "web"
  | "powershell"
  | "cmd";

/** The pentest lifecycle phases (spec §63 state machine, §87 flow). */
export type PhaseId =
  | "authorization"
  | "recon"
  | "scanning"
  | "enumeration"
  | "vuln_analysis"
  | "validation"
  | "exploitation"
  | "initial_access"
  | "post_exploitation"
  | "privilege_escalation"
  | "impact"
  | "cleanup"
  | "reporting";

/* ---------- Commands (spec §16 command details) ---------- */

export interface CommandFlag {
  flag: string;
  meaning: string;
}

export interface Command {
  id: string;
  /** The command template; may contain <TARGET>, <IP>, <PORT>, <URL>, <DOMAIN> tokens. */
  command: string;
  platform: Platform;
  /** One line: what it does. */
  purpose: string;
  /** When you'd reach for it. */
  whenToUse?: string;
  /** Why *here*, in this workflow. */
  why?: string;
  flags?: CommandFlag[];
  /** A realistic (illustrative) example of output. Clearly example, never presented as the user's real result. */
  exampleOutput?: string;
  /** Interesting indicators to scan the output for. */
  lookFor?: string[];
  /** Beginner traps. */
  commonMistakes?: string[];
  risk?: RiskLevel;
  /** What this typically leads to next. */
  next?: string;
  /** Tags for search / grouping (e.g. "nmap", "smb"). */
  tags?: string[];
}

/* ---------- Branches / decision (spec §53 What-if) ---------- */

/** A resolvable link into a service module, lesson, decision node, phase, or route. */
export type GotoRef = {
  type: "service" | "lesson" | "node" | "phase" | "route";
  id: string;
};

export interface Branch {
  /** The condition, human readable ("Passwordless sudo entry present"). */
  condition: string;
  /** What it means / what to do. */
  outcome: string;
  /** Optional link to a service module, lesson, or decision node. */
  goto?: GotoRef;
  risk?: RiskLevel;
}

/* ---------- Exercises (spec §41 Your Turn) ---------- */

export interface Exercise {
  id: string;
  prompt: string;
  /** Optional supplied context (e.g. an nmap snippet to reason about). */
  scenario?: string;
  options?: string[];
  /** Index of the best option, if multiple choice. */
  answerIndex?: number;
  /** Teacher's explanation of the reasoning. */
  explanation: string;
}

/* ---------- Lesson (spec §40 lesson format) ---------- */

export interface Lesson {
  id: string;
  title: string;
  /** Category slug, e.g. "recon", "web", "linux". */
  category: string;
  /** Human category label. */
  categoryLabel?: string;
  difficulty: Difficulty;
  /** Short summary for cards & search. */
  summary: string;
  estMinutes?: number;
  /** ATT&CK / methodology tags (PTES, OWASP…). */
  methodology?: string[];
  objectives: string[];
  /** Conversational teacher intro. */
  teacherIntro: string;
  /** Why this matters. */
  why?: string;
  commands?: Command[];
  /** What to look for across this lesson's output. */
  lookFor?: string[];
  branches?: Branch[];
  /** Beginner traps. */
  commonMistakes?: string[];
  /** Concept notes rendered as prose blocks. */
  notes?: LessonNote[];
  exercise?: Exercise;
  /** Follow-on lesson / module ids. */
  next?: string[];
  related?: string[];
  keywords?: string[];
}

export interface LessonNote {
  heading?: string;
  body: string;
  tone?: "default" | "info" | "warning" | "success" | "teacher" | "tip";
}

/* ---------- Service module (spec §21) ---------- */

export interface ServiceModule {
  id: string; // e.g. "smb"
  name: string; // "SMB"
  ports: number[];
  category: "network" | "database" | "application" | "web" | "remote";
  /** One-line summary. */
  tagline: string;
  /** What the service is (teacher voice). */
  what: string;
  /** Why it matters to an attacker. */
  why: string;
  /** Ordered enumeration steps. */
  objective: string;
  commands: Command[];
  lookFor: string[];
  branches: Branch[];
  commonMistakes?: string[];
  /** Related lesson ids. */
  relatedLessons?: string[];
  risk?: RiskLevel;
  keywords?: string[];
}

/* ---------- Decision engine (spec §19, §64) ---------- */

export interface DecisionNode {
  id: string;
  label: string;
  /** What this decision point represents. */
  description?: string;
  /** Child options the user can take. */
  options: DecisionOption[];
  phase?: PhaseId;
}

export interface DecisionOption {
  label: string;
  detail?: string;
  /** Where selecting this leads. */
  goto: GotoRef;
  risk?: RiskLevel;
  icon?: string;
}

/** Maps a discovered port -> service module + guidance (spec §19). */
export interface PortMapping {
  port: number;
  altPorts?: number[];
  protocol: "tcp" | "udp" | "tcp/udp";
  service: string; // canonical short name shown to user
  serviceModuleId?: string; // link into service modules
  os?: "linux" | "windows" | "any";
  summary: string;
  investigate: string[];
  commands?: string[];
  nextSteps?: string[];
  relatedLessons?: string[];
  keywords?: string[];
}

/* ---------- Glossary (spec §81) ---------- */

export interface GlossaryTerm {
  term: string;
  short: string; // one-liner used in tooltips
  long?: string;
  related?: string[];
  category?: string;
}

/* ---------- Quick reference (spec §48) ---------- */

export interface ReferenceEntry {
  command: string;
  description: string;
  platform?: Platform;
  risk?: RiskLevel;
}

export interface ReferenceSection {
  id: string;
  title: string;
  icon?: string;
  intro?: string;
  entries: ReferenceEntry[];
}

/* ---------- Labs (spec §42) ---------- */

export interface Lab {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  situation: string;
  known: string[];
  objective: string;
  hints: string[];
  questions: LabQuestion[];
  /** Teacher walkthrough. */
  solution: string;
  lessonsLearned: string[];
  relatedLessons?: string[];
}

export interface LabQuestion {
  q: string;
  a: string;
}

/* ---------- Checklists (spec §72) ---------- */

export interface Checklist {
  id: string;
  title: string;
  phase?: PhaseId;
  items: string[];
}

/* ============================================================
   ASSESSMENT (live user state)
   ============================================================ */

export type Environment =
  | "htb"
  | "thm"
  | "ctf"
  | "personal"
  | "authorized"
  | "other";

export type StartingPoint =
  | "new"
  | "known_ports"
  | "known_web"
  | "have_creds"
  | "have_shell"
  | "custom";

export interface Scope {
  authorizedTargets: string;
  allowedIps?: string;
  allowedDomains?: string;
  exclusions?: string;
  constraints?: string;
  /** User attests they are authorized to test. */
  authorized: boolean;
}

export interface DiscoveredService {
  id: string;
  port: number;
  protocol: "tcp" | "udp";
  service: string;
  version?: string;
  status: "open" | "filtered" | "closed";
  notes?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  ip?: string;
  hostname?: string;
  domain?: string;
  os?: "linux" | "windows" | "unknown";
  notes?: string;
}

export type NoteType =
  | "note"
  | "observation"
  | "hypothesis"
  | "command"
  | "credential"
  | "finding"
  | "todo"
  | "evidence"
  | "url"
  | "user";

export interface Note {
  id: string;
  type: NoteType;
  content: string;
  tags: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type FindingStatus =
  | "discovered"
  | "investigating"
  | "validated"
  | "reported"
  | "retested"
  | "resolved";

export interface Finding {
  id: string;
  title: string;
  asset?: string;
  severity: Severity;
  status: FindingStatus;
  description?: string;
  evidence?: string;
  reproduction?: string;
  impact?: string;
  remediation?: string;
  references?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommandExecution {
  id: string;
  command: string;
  phase?: PhaseId;
  output?: string;
  commandRefId?: string; // links back to a Command in content
  timestamp: string;
}

export type TimelineKind =
  | "phase"
  | "command"
  | "finding"
  | "service"
  | "note"
  | "access"
  | "credential"
  | "milestone";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  label: string;
  detail?: string;
  timestamp: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  kind: "output" | "request" | "note" | "screenshot-ref";
  content: string;
  linkedFindingId?: string;
  createdAt: string;
}

export interface PhaseState {
  id: PhaseId;
  status: "pending" | "active" | "done";
}

export interface Assessment {
  id: string;
  name: string;
  environment: Environment;
  startingPoint: StartingPoint;
  scope: Scope;
  asset: Asset;
  currentPhase: PhaseId;
  phases: PhaseState[];
  services: DiscoveredService[];
  notes: Note[];
  findings: Finding[];
  history: CommandExecution[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  credentials: Credential[];
  /** Free-form current objective / next-step the teacher last set. */
  currentObjective?: string;
  nextAction?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  username?: string;
  secret?: string;
  kind: "password" | "hash" | "key" | "token" | "other";
  service?: string;
  works?: "yes" | "no" | "untested";
  createdAt: string;
}

/* ============================================================
   PARSER + AI result types (spec §17, §60)
   ============================================================ */

/** A single interpreted observation from pasted output. */
export interface ParsedObservation {
  /** Strictly what the output shows. */
  label: string;
  detail?: string;
  /** Optional structured discovery to record (e.g. a service). */
  service?: { port: number; protocol: "tcp" | "udp"; service: string; version?: string; status: "open" | "filtered" | "closed" };
  /** Suggested branch. */
  branch?: { label: string; goto: GotoRef };
  severityHint?: "info" | "notable";
}

export interface ParseResult {
  parser: string; // "nmap", "http", ...
  matched: boolean;
  /** Human summary headline, e.g. "3 services found". */
  headline?: string;
  observations: ParsedObservation[];
  /** Next-step suggestions (routes/services). */
  suggestions: { label: string; detail?: string; goto: GotoRef }[];
  /** Non-fabrication reminder shown to the user. */
  caveat?: string;
}

/* ---------- AI abstraction (spec §12, §60, §61) ---------- */

export interface AnalysisInput {
  output: string;
  context?: { phase?: PhaseId; target?: string; hint?: string };
}

/** Every claim is tagged with epistemic status (spec §13). */
export type ClaimKind = "observed" | "inference" | "hypothesis";

export interface AnalysisClaim {
  kind: ClaimKind;
  text: string;
}

export interface AnalysisResult {
  provider: string;
  summary: string;
  claims: AnalysisClaim[];
  suggestions: { label: string; detail?: string; goto?: GotoRef }[];
  raw: string; // preserved user output
}

export interface ExplanationInput {
  concept: string;
  context?: string;
}

export interface NextStepInput {
  assessmentSummary: string;
  known: string[];
}

export interface NextStepResult {
  recommendation: string;
  rationale: string;
  command?: string;
}

export interface TeacherAIProvider {
  id: string;
  label: string;
  requiresKey: boolean;
  analyzeOutput(input: AnalysisInput): Promise<AnalysisResult>;
  explainConcept(input: ExplanationInput): Promise<string>;
  suggestNextStep(input: NextStepInput): Promise<NextStepResult>;
}

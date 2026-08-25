import { useAssessments } from "@/store/assessments";

/**
 * Seed a clearly-labeled demo assessment (spec §96) so the dashboard/workspace
 * are populated on first open. Runs once; the user can delete it anytime.
 */
export function seedDemoIfEmpty() {
  const store = useAssessments.getState();
  if (store.assessments.length > 0) return;
  if (localStorage.getItem("pt.demoSeeded") === "1") return;

  const id = store.createAssessment({
    name: "HTB — Demo Machine",
    environment: "htb",
    startingPoint: "known_ports",
    scope: {
      authorizedTargets: "10.10.10.10",
      allowedIps: "10.10.10.10",
      exclusions: "None",
      constraints: "Lab environment — for demonstration only.",
      authorized: true,
    },
    asset: { id: "demo-asset", ip: "10.10.10.10", hostname: "demo", os: "linux" },
    isDemo: true,
  });

  const s = useAssessments.getState();
  s.setPhase(id, "enumeration");
  s.completePhase(id, "authorization");
  s.completePhase(id, "recon");
  s.completePhase(id, "scanning");
  s.setObjective(
    id,
    "Understand the web application on port 80 — technology, structure, and any authentication.",
    "Run content discovery against the web root."
  );

  s.addService(id, { port: 22, protocol: "tcp", service: "ssh", version: "OpenSSH 8.2p1 Ubuntu", status: "open" });
  s.addService(id, { port: 80, protocol: "tcp", service: "http", version: "Apache 2.4.41", status: "open" });
  s.addService(id, { port: 445, protocol: "tcp", service: "microsoft-ds", version: "Samba 4.x", status: "open" });

  s.addNote(id, { type: "observation", content: "Three services exposed: SSH, HTTP, SMB. Starting with HTTP for information yield.", tags: ["recon", "demo"] });
  s.addNote(id, { type: "hypothesis", content: "SMB (Samba) may allow anonymous share access — worth a null-session check.", tags: ["smb", "demo"] });
  s.addNote(id, { type: "todo", content: "Run ffuf content discovery on the web root.", tags: ["web", "demo"] });

  s.addFinding(id, {
    title: "SMB signing not required (demo)",
    severity: "low",
    status: "discovered",
    asset: "10.10.10.10",
    description: "The host reports SMB signing as not required. Recorded as an example finding in the demo assessment.",
    impact: "May enable NTLM relay in the presence of a coercion primitive.",
    remediation: "Require SMB signing via group policy.",
  });

  localStorage.setItem("pt.demoSeeded", "1");
}

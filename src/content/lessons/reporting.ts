import type { Lesson } from "@/types";

export const reportingLessons: Lesson[] = [
  {
    id: "report-findings",
    title: "Writing a Good Finding",
    category: "reporting",
    categoryLabel: "Reporting",
    difficulty: "beginner",
    summary: "The anatomy of a finding that a developer can actually act on: title, severity, evidence, reproduction, impact, remediation.",
    estMinutes: 8,
    methodology: ["OWASP", "PTES: Reporting"],
    objectives: ["Structure a finding", "Write for the fixer, not the attacker", "Separate fact from inference"],
    teacherIntro:
      "The report is the product the client pays for. A finding isn't 'I hacked it' — it's a clear, reproducible explanation a defender can use to fix the issue and understand why it matters. Precision and honesty are everything.",
    why: "A brilliant exploit with a vague writeup gets ignored; a clearly documented medium-severity issue gets fixed. The writeup is where value is delivered.",
    notes: [
      { heading: "The anatomy", body: "Title, Severity, Affected asset, Description, Evidence, Reproduction steps, Impact (business terms), Remediation, References, Status." },
      { heading: "Evidence, not assertion", body: "Show the request/response, the command output, the screenshot. Only claim what your evidence supports. 'Version X is present' is a fact; 'Version X is vulnerable to CVE-Y' needs validation.", tone: "warning" },
      { heading: "Impact in business terms", body: "Translate 'SQLi in /login' into 'an unauthenticated attacker can read all customer records'. That's what decision-makers act on." },
      { heading: "Remediation the team can use", body: "Concrete and specific: 'use parameterized queries', not 'be more secure'. Add references (CWE/OWASP).", tone: "teacher" },
    ],
    lookFor: ["Every field filled", "Evidence attached", "Impact stated in business terms", "Actionable remediation"],
    branches: [
      { condition: "You have validated findings and evidence", outcome: "Assemble the full report from your recorded data.", goto: { type: "route", id: "/a/:id?tab=report" } },
    ],
    next: ["report-severity", "report-evidence"],
    keywords: ["report", "finding", "severity", "remediation", "writeup"],
  },
  {
    id: "report-severity",
    title: "Severity & CVSS Basics",
    category: "reporting",
    categoryLabel: "Reporting",
    difficulty: "beginner",
    summary: "How to reason about severity consistently, and why context (exploitability + impact) matters more than a raw score.",
    estMinutes: 6,
    objectives: ["Reason about likelihood and impact", "Use CVSS as a guide, not gospel", "Avoid severity inflation"],
    teacherIntro:
      "Severity should reflect both how easily an issue can be exploited and how bad the outcome is — in this environment. CVSS gives a common language, but a 'critical' behind three other controls may be lower risk in practice.",
    why: "Consistent, defensible severity ratings build trust. Inflating everything to critical trains clients to ignore you.",
    notes: [
      { heading: "Two axes", body: "Likelihood (how reachable/exploitable) × Impact (confidentiality/integrity/availability). A trivially exploitable info leak and a hard-to-reach RCE can land in surprising places once you weigh both." },
      { heading: "CVSS", body: "A structured scoring system (base/temporal/environmental). Use the base score as a starting point, then adjust for the real environment and context." },
      { heading: "Be honest", body: "If exploitation required an unrealistic precondition, say so and rate accordingly. Credibility compounds.", tone: "teacher" },
    ],
    lookFor: ["Both likelihood and impact considered", "Context-adjusted rating", "Consistent scale across findings"],
    next: ["report-findings"],
    keywords: ["severity", "cvss", "risk", "rating", "impact"],
  },
  {
    id: "report-evidence",
    title: "Evidence & the Timeline",
    category: "reporting",
    categoryLabel: "Reporting",
    difficulty: "beginner",
    summary: "Capture proof as you go and keep a timeline — reconstructing it afterward is painful and error-prone.",
    estMinutes: 5,
    objectives: ["Capture evidence contemporaneously", "Maintain a timeline", "Keep raw output intact"],
    teacherIntro:
      "Evidence collected in the moment is worth ten times evidence reconstructed from memory. Screenshot, save command output, and note timestamps as you work. Your future self writing the report will thank you.",
    why: "Findings without evidence are just claims. A clean timeline also demonstrates professionalism and helps the client correlate with their own logs.",
    notes: [
      { heading: "Capture in the moment", body: "Save the exact request/response and command output the instant you get a result. Store it against the finding it supports." },
      { heading: "Timeline", body: "Note when each milestone happened (initial access, escalation, key findings). This app builds one automatically as you record events." },
      { heading: "Preserve raw output", body: "Keep the unedited output alongside any interpretation. Never let a summary replace the source.", tone: "warning" },
    ],
    lookFor: ["Evidence linked to findings", "A coherent timeline", "Raw output preserved"],
    next: ["report-findings"],
    keywords: ["evidence", "timeline", "screenshots", "proof", "reporting"],
  },
];

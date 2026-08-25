import { useAssessments } from "@/store/assessments";
import { useTarget } from "@/store/target";

/**
 * Template variables (<TARGET>, <DOMAIN>, <PORTS>, <YOUR_IP>, <WORDLIST>…) used
 * to pre-fill every command so it's copy-ready.
 *
 * The TARGET / DOMAIN / PORTS you see in commands come ONLY from the global
 * Target bar — i.e. exactly what YOU typed. Nothing is auto-pulled from a saved
 * assessment, so a real target you entered elsewhere never leaks into the
 * command lists. When a field is empty, the command keeps its <PLACEHOLDER>.
 *
 * Ports come from the bar; if the bar's Ports field is empty we fall back to the
 * open ports discovered in the active assessment (a convenience, not a name).
 * USER / PASS fall back to the active assessment's first credential.
 */
export function useActiveVars(): {
  vars: Record<string, string | undefined>;
  assessmentId?: string;
} {
  const activeId = useAssessments((s) => s.activeId);
  const a = useAssessments((s) => s.assessments.find((x) => x.id === s.activeId));
  const t = useTarget();

  // Ports: bar input first (comma/space separated), else discovered ports.
  // Validated (1–65535), de-duplicated, order preserved — never any stray
  // spaces or repeats, so the generated command is always valid syntax.
  const validPort = (p: string) => /^\d{1,5}$/.test(p) && +p >= 1 && +p <= 65535;
  const barPorts = [
    ...new Set(
      t.ports
        .split(/[\s,]+/)
        .map((p) => p.trim())
        .filter(validPort)
    ),
  ];
  const discovered = (a?.services ?? [])
    .filter((s) => s.status === "open")
    .map((s) => String(s.port));
  const ports = barPorts.length ? barPorts : discovered;

  const cred = a?.credentials[0];

  const clean = (v: string) => (v.trim() ? v.trim() : undefined);

  return {
    assessmentId: activeId ?? undefined,
    vars: {
      TARGET: clean(t.target),
      IP: clean(t.target),
      // Common aliases people use in their own commands (case-insensitive fill):
      RHOST: clean(t.target),
      RHOSTS: clean(t.target),
      HOST: clean(t.target),
      DOMAIN: clean(t.domain),
      NS: clean(t.domain),
      YOUR_IP: clean(t.lhost),
      LHOST: clean(t.lhost),
      WORDLIST: clean(t.wordlist),
      wl: clean(t.wordlist),
      PORTS: ports.length ? ports.join(",") : undefined,
      PORT: ports.length ? ports[0] : undefined,
      RPORT: ports.length ? ports[0] : undefined,
      USER: cred?.username || undefined,
      PASS: cred?.secret || undefined,
    },
  };
}

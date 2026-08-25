import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A single global "engagement target" so you set your target ONCE and every
 * command in the app (Quick Reference, Pentest Flow, lessons, service modules)
 * auto-fills — copy-ready. This is the fix for "I pasted my IP but the command
 * still had <TARGET> / <PORTS> in it and didn't run."
 */
export interface TargetState {
  /** Target IP or hostname — fills <TARGET> and <IP>. */
  target: string;
  /** Target domain — fills <DOMAIN> and <NS>. */
  domain: string;
  /** Open ports, comma-separated (e.g. "22,80,445") — fills <PORTS>; first fills <PORT>. */
  ports: string;
  /** YOUR attacking machine IP (VPN/tun0) — fills <YOUR_IP> / <LHOST>. */
  lhost: string;
  /** Default wordlist path — fills <WORDLIST> / <wordlist> / <wl>. */
  wordlist: string;

  setField: (k: "target" | "domain" | "ports" | "lhost" | "wordlist", v: string) => void;
  reset: () => void;
}

const DEFAULT_WORDLIST = "/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt";

export const useTarget = create<TargetState>()(
  persist(
    (set) => ({
      target: "",
      domain: "",
      ports: "",
      lhost: "",
      wordlist: DEFAULT_WORDLIST,
      setField: (k, v) => set({ [k]: v } as Partial<TargetState>),
      reset: () => set({ target: "", domain: "", ports: "", lhost: "", wordlist: DEFAULT_WORDLIST }),
    }),
    { name: "pt.target.v1" }
  )
);

export { DEFAULT_WORDLIST };

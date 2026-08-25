import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, ChevronDown, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTarget } from "@/store/target";

/**
 * Global target bar. Type your target once and every command in the app
 * auto-fills (<TARGET>, <YOUR_IP>, <DOMAIN>, <WORDLIST>). Slim by default,
 * expands for the extra fields.
 */
export function TargetBar() {
  const { target, domain, ports, lhost, wordlist, setField, reset } = useTarget();
  const [open, setOpen] = useState(false);
  const isSet = target.trim().length > 0;

  return (
    <div className="z-10 border-b border-line bg-base/60">
      <div className="mx-auto flex w-full max-w-none flex-wrap items-center gap-2 px-3 py-2 sm:px-5 lg:px-8">
        <div
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-lg border",
            isSet ? "border-primary/40 bg-primary/12 text-primary" : "border-line bg-surface text-subtle"
          )}
        >
          <Crosshair className="h-4 w-4" />
        </div>

        <label className="flex min-w-[150px] max-w-[16rem] flex-[2] items-center gap-2">
          <span className="shrink-0 text-[12px] font-medium text-subtle">Target</span>
          <input
            value={target}
            onChange={(e) => setField("target", e.target.value)}
            placeholder="e.g. 10.10.10.10"
            className="h-8 w-full min-w-0 rounded-lg border border-line bg-surface/70 px-2.5 font-mono text-[13px] text-fg placeholder:text-subtle/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex min-w-[120px] max-w-[11rem] flex-1 items-center gap-2">
          <span className="shrink-0 text-[12px] font-medium text-subtle">Ports</span>
          <input
            value={ports}
            onChange={(e) => setField("ports", e.target.value)}
            placeholder="e.g. 22,80,445"
            className="h-8 w-full min-w-0 rounded-lg border border-line bg-surface/70 px-2.5 font-mono text-[13px] text-fg placeholder:text-subtle/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex min-w-[130px] max-w-[12rem] flex-1 items-center gap-2">
          <span className="shrink-0 text-[12px] font-medium text-subtle">LHOST</span>
          <input
            value={lhost}
            onChange={(e) => setField("lhost", e.target.value)}
            placeholder="your tun0 IP"
            className="h-8 w-full min-w-0 rounded-lg border border-line bg-surface/70 px-2.5 font-mono text-[13px] text-fg placeholder:text-subtle/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {isSet && (
          <span className="hidden items-center gap-1 text-[11.5px] text-success xl:inline-flex">
            <Check className="h-3.5 w-3.5" /> commands auto-fill
          </span>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          More
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-line/60"
          >
            <div className="mx-auto grid w-full gap-3 px-3 py-3 sm:grid-cols-2 sm:px-5 lg:px-8">
              {/* Target / Ports / LHOST live in the compact row above — here are the extras only. */}
              <Field label="Domain" value={domain} onChange={(v) => setField("domain", v)} placeholder="corp.local" mono />
              <Field label="Wordlist" value={wordlist} onChange={(v) => setField("wordlist", v)} placeholder="/usr/share/seclists/..." mono />
              <div className="sm:col-span-2">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-fg"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset fields
                </button>
                <p className="mt-1 text-[11.5px] text-subtle">
                  These fill <code className="text-caution">&lt;TARGET&gt;</code>,{" "}
                  <code className="text-caution">&lt;PORTS&gt;</code>,{" "}
                  <code className="text-caution">&lt;YOUR_IP&gt;</code>,{" "}
                  <code className="text-caution">&lt;DOMAIN&gt;</code>,{" "}
                  <code className="text-caution">&lt;WORDLIST&gt;</code> everywhere — using only what you
                  type here (no saved target is ever inserted for you). Leave a field blank and the
                  command keeps its placeholder.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-subtle">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-8 w-full rounded-lg border border-line bg-surface/70 px-2.5 text-[13px] text-fg placeholder:text-subtle focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          mono && "font-mono"
        )}
      />
    </label>
  );
}

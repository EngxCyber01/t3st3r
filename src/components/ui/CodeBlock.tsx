import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/utils";

/**
 * Lightweight, dependency-free shell/command highlighter.
 * Tokens we recognize: template placeholders (<TARGET>), flags (-p, --script),
 * comments (# ...), pipes/redirects, and the leading tool name.
 * This is presentation only — the app never executes anything (spec §79).
 */
function highlightLine(line: string, index: number): ReactNode {
  if (line.trim().startsWith("#")) {
    return (
      <span key={index} className="text-subtle italic">
        {line}
      </span>
    );
  }
  const tokens = line.split(/(\s+)/);
  let firstWordSeen = false;
  return tokens.map((tok, i) => {
    if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
    // template placeholder
    if (/^<[^>]+>$/.test(tok)) {
      return (
        <span
          key={i}
          className="rounded bg-primary/15 px-1 text-primary"
          title="Replace with your value"
        >
          {tok}
        </span>
      );
    }
    if (tok.startsWith("--") || /^-[A-Za-z]/.test(tok)) {
      return (
        <span key={i} className="text-caution">
          {tok}
        </span>
      );
    }
    if (tok === "|" || tok === ">" || tok === ">>" || tok === "&&" || tok === ";") {
      return (
        <span key={i} className="text-teacher">
          {tok}
        </span>
      );
    }
    if (!firstWordSeen && /^[A-Za-z0-9._/-]+$/.test(tok)) {
      firstWordSeen = true;
      return (
        <span key={i} className="font-semibold text-info">
          {tok}
        </span>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

export function CodeBlock({
  code,
  language,
  copyable = true,
  className,
  dense,
  onCopy,
}: {
  code: string;
  language?: string;
  copyable?: boolean;
  className?: string;
  dense?: boolean;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");

  async function handleCopy() {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-line bg-base/70",
        className
      )}
    >
      {(language || copyable) && (
        <div className="flex items-center justify-between border-b border-line/70 bg-surface-2/60 px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">
            {language ?? "shell"}
          </span>
          {copyable && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted transition-colors hover:bg-raised hover:text-fg"
              aria-label="Copy command"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      <pre
        className={cn(
          "overflow-x-auto font-mono text-[13px] leading-relaxed text-fg/90",
          dense ? "p-3" : "p-4"
        )}
      >
        <code>
          {lines.map((ln, i) => (
            <div key={i} className="whitespace-pre">
              {highlightLine(ln, i)}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

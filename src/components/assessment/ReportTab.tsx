import { useMemo } from "react";
import { FileText, Copy, Download, Printer } from "lucide-react";
import type { Assessment } from "@/types";
import { Button, Callout, useToast } from "@/components/ui";
import { generateReport } from "@/lib/report";
import { copyToClipboard } from "@/lib/utils";

export function ReportTab({ assessment }: { assessment: Assessment }) {
  const { toast } = useToast();
  const markdown = useMemo(() => generateReport(assessment), [assessment]);

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assessment.name.replace(/[^a-z0-9]+/gi, "_")}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Report downloaded (.md)", "success");
  }

  function printReport() {
    const w = window.open("", "_blank");
    if (!w) {
      toast("Popup blocked — allow popups to print", "warning");
      return;
    }
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(assessment.name)} — Report</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#111;line-height:1.55}
        pre{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12px}
        h1{border-bottom:2px solid #111;padding-bottom:8px}
        h2{margin-top:28px;border-bottom:1px solid #ccc;padding-bottom:4px}
      </style></head><body><pre>${esc(markdown)}</pre></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-[15px] font-semibold text-fg">Assessment report</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={() => { copyToClipboard(markdown); toast("Markdown copied", "success"); }}>
            Copy Markdown
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={download}>
            Download .md
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={printReport}>
            Print / PDF
          </Button>
        </div>
      </div>

      <Callout tone="info">
        This report is generated entirely from what you recorded — services, findings, evidence, timeline,
        and notes. Nothing is invented. Fill in more findings and evidence to enrich it.
      </Callout>

      <div className="overflow-hidden rounded-2xl border border-line bg-base/60">
        <div className="border-b border-line bg-surface-2/60 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-subtle">
          report.md — preview
        </div>
        <pre className="max-h-[60vh] overflow-auto p-5 font-mono text-[12.5px] leading-relaxed text-fg/90 whitespace-pre-wrap">
          {markdown}
        </pre>
      </div>
    </div>
  );
}

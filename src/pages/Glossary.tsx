import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BookA, Search } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Input, Chip } from "@/components/ui";
import { GLOSSARY } from "@/content/glossary";
import { includesCI } from "@/lib/utils";

export function Glossary() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    const term = params.get("q");
    if (term) setQ(term);
  }, [params]);

  const terms = useMemo(() => {
    const list = q ? GLOSSARY.filter((t) => includesCI(`${t.term} ${t.short} ${t.long ?? ""}`, q)) : GLOSSARY;
    return [...list].sort((a, b) => a.term.localeCompare(b.term));
  }, [q]);

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Reference"
        title="Glossary"
        description="Plain-language definitions of the terms you'll meet. When you see jargon, look it up here."
        icon={<BookA className="h-5 w-5" />}
      />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms…" className="pl-9" autoFocus />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((t) => (
          <div key={t.term} className="rounded-xl border border-line bg-surface/60 p-4">
            <h3 className="text-[14px] font-semibold text-fg">{t.term}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.short}</p>
            {t.long && <p className="mt-2 text-[12.5px] leading-relaxed text-subtle">{t.long}</p>}
            {t.related && t.related.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.related.map((r) => (
                  <Chip key={r} onClick={() => setQ(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {terms.length === 0 && <p className="py-10 text-center text-[13px] text-subtle">No terms match “{q}”.</p>}
    </Page>
  );
}

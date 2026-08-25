import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, GraduationCap } from "lucide-react";
import type { Exercise } from "@/types";
import { cn } from "@/lib/cn";
import { CodeBlock } from "@/components/ui/CodeBlock";

/** Interactive "Your Turn" exercise (spec §41). Reveals the teacher's answer after a guess. */
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const hasOptions = exercise.options && exercise.options.length > 0;
  const correct = exercise.answerIndex;

  return (
    <div className="rounded-2xl border border-teacher/25 bg-teacher/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-teacher">
        <Brain className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Your turn</span>
      </div>

      <p className="text-[14px] font-medium text-fg">{exercise.prompt}</p>

      {exercise.scenario && (
        <div className="mt-3">
          <CodeBlock code={exercise.scenario} language="scenario" copyable={false} dense />
        </div>
      )}

      {hasOptions && (
        <div className="mt-3 space-y-2">
          {exercise.options!.map((opt, i) => {
            const isChosen = choice === i;
            const isCorrect = revealed && correct === i;
            const isWrongChoice = revealed && isChosen && correct !== i;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setChoice(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors",
                  isCorrect && "border-success/50 bg-success/10 text-fg",
                  isWrongChoice && "border-critical/50 bg-critical/10 text-fg",
                  !revealed && isChosen && "border-teacher/50 bg-teacher/10 text-fg",
                  !revealed && !isChosen && "border-line bg-surface/50 text-muted hover:border-line-strong hover:text-fg",
                  revealed && !isCorrect && !isWrongChoice && "border-line bg-surface/30 text-subtle"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                    isChosen ? "border-current" : "border-line text-subtle"
                  )}
                >
                  {revealed && isCorrect ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : revealed && isWrongChoice ? (
                    <X className="h-3 w-3 text-critical" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={hasOptions && choice === null}
            className="inline-flex items-center gap-2 rounded-lg bg-teacher/15 px-3.5 py-2 text-[13px] font-medium text-teacher transition-colors hover:bg-teacher/20 disabled:opacity-50"
          >
            <GraduationCap className="h-4 w-4" />
            {hasOptions ? "Check my answer" : "Show teacher's answer"}
          </button>
        ) : null}

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 rounded-xl border border-teacher/25 bg-surface/60 p-3.5"
            >
              <div className="mb-1.5 flex items-center gap-2 text-teacher">
                <GraduationCap className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Teacher's answer</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-fg/90">{exercise.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

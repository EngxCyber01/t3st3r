import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldHalf, Compass, GraduationCap, ArrowRight, ScanSearch, BookOpen } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui";
import { useSettings } from "@/store/settings";

const STEPS = [
  {
    icon: <ShieldHalf className="h-6 w-6" />,
    title: "This isn't a command dump.",
    body: "It's your pentesting teacher. When you have a target and don't know what to do next, this app answers that question — with the reasoning behind it — at every step.",
  },
  {
    icon: <ScanSearch className="h-6 w-6" />,
    title: "The loop you'll live in",
    body: "Discover → Understand → Decide → Test → Learn. Run a command yourself, paste the result, and the teacher interprets it and hands you the next decision.",
  },
  {
    icon: <Compass className="h-6 w-6" />,
    title: "Never feel lost",
    body: "Two buttons are always in the top bar: “I found something” routes you to the right workflow, and “I'm stuck” helps you find the next question to ask.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Authorized labs only",
    body: "Everything here is for HTB, TryHackMe, CTFs, personal labs, and engagements you're authorized to test. The app teaches and organizes — it never attacks anything for you.",
  },
];

export function Onboarding() {
  const done = useSettings((s) => s.onboardingComplete);
  const complete = useSettings((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  if (done) return null;
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  function finish(toNew = false) {
    complete();
    if (toNew) navigate("/new");
  }

  return (
    <Dialog open onClose={() => finish(false)} size="md" className="overflow-hidden">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/12 to-transparent" />
        <div className="relative p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary shadow-glow">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-fg">Welcome to T3st3r</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-raised text-primary">
                {s.icon}
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-fg">{s.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-primary" : "w-1.5 bg-line-strong"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => finish(false)}>
                Skip
              </Button>
              {isLast ? (
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => finish(true)}
                >
                  Create first assessment
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => setStep((x) => x + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

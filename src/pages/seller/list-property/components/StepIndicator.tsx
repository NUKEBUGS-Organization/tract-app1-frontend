import { CheckCircle2 } from "lucide-react";
import { STEPS } from "../constants";

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : active
                      ? "border-[var(--color-secondary)] bg-white shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
                      : "border-[var(--color-border-light)] bg-white"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-[var(--color-secondary)]"
                        : "text-[var(--color-text-muted)]"
                    }`}
                  />
                )}
              </div>

              <span
                className={`hidden text-[10px] font-black uppercase tracking-[0.15em] sm:block ${
                  active
                    ? "text-[var(--color-primary)]"
                    : done
                      ? "text-[var(--color-primary)]/50"
                      : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-10 sm:w-20 ${
                  done
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-border-light)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
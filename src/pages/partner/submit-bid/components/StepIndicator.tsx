import { CheckCircle2 } from "lucide-react";
import { BID_STEPS } from "../constants";
import { usePartnerTheme } from '../../../../hooks/usePartnerTheme';

interface StepIndicatorProps {
  current: number;
}

export default function BidStepIndicator({ current }: StepIndicatorProps) {
  const isDark = usePartnerTheme() === "dark";
  return (
    <div className="flex items-center">
      {BID_STEPS.map((step, index) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${done
                  ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]"
                  : active
                    ? "border-[var(--color-secondary)] bg-white/10 shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
                    : isDark
                      ? "border-white/20 bg-white/5"
                      : "border-[var(--color-border-light)] bg-white"
                  }`}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-dark-main)]" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${active
                      ? "text-[var(--color-secondary)]"
                      : isDark
                        ? "text-white/30"
                        : "text-[var(--color-text-muted)]"
                      }`}
                  />
                )}
              </div>

              <span
                className={`hidden text-[10px] font-black uppercase tracking-[0.15em] sm:block ${active
                  ? "text-[var(--color-secondary)]"
                  : done
                    ? "text-[var(--color-secondary)]/50"
                    : isDark
                      ? "text-white/30"
                      : "text-[var(--color-text-muted)]"
                  }`}
              >
                {step.label}
              </span>
            </div>

            {index < BID_STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-10 sm:w-20 ${done
                  ? "bg-[var(--color-secondary)]"
                  : isDark
                    ? "bg-white/10"
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
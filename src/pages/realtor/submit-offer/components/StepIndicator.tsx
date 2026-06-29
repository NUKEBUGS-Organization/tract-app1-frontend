import { CheckCircle2 } from "lucide-react";
import { OFFER_STEPS } from "../constants";

interface StepIndicatorProps {
  currentStep: number;
  isDark: boolean;
}

export default function StepIndicator({ currentStep, isDark }: StepIndicatorProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {OFFER_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = currentStep === s.id;
          const isDone = currentStep > s.id;

          return (
            <div
              key={s.id}
              className={`flex items-center ${i < OFFER_STEPS.length - 1 ? "flex-1" : ""}`}
            >
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isDone
                      ? isDark
                        ? "border-[#d4af37] bg-[#d4af37]"
                        : "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : isActive
                        ? isDark
                          ? "border-[#d4af37] bg-white/10 shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
                          : "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
                        : isDark
                          ? "border-white/20 bg-white/5"
                          : "border-[var(--color-border-light)] bg-white"
                    }`}
                >
                  {isDone ? (
                    <CheckCircle2
                      className={`h-5 w-5 ${isDark ? "text-black" : "text-white"}`}
                    />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${isActive
                          ? isDark
                            ? "text-[#d4af37]"
                            : "text-[var(--color-secondary)]"
                          : isDark
                            ? "text-white/40"
                            : "text-[var(--color-text-muted)]"
                        }`}
                    />
                  )}
                </div>

                {/* Label — hidden on small screens */}
                <p
                  className={`hidden text-[10px] font-black uppercase tracking-wider sm:block ${isActive
                      ? isDark
                        ? "text-[#d4af37]"
                        : "text-[var(--color-secondary)]"
                      : isDone
                        ? isDark
                          ? "text-[#d4af37]/70"
                          : "text-[var(--color-primary)]/70"
                        : isDark
                          ? "text-white/40"
                          : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {s.label}
                </p>
              </div>

              {/* Connecting line between circles */}
              {i < OFFER_STEPS.length - 1 && (
                <div
                  className={`mb-4 h-0.5 flex-1 transition-all ${currentStep > s.id
                      ? isDark
                        ? "bg-[#d4af37]"
                        : "bg-[var(--color-primary)]"
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
    </div>
  );
}

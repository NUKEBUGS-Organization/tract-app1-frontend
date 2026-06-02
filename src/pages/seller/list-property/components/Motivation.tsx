import { Clock, Info } from "lucide-react";
import { SELL_REASONS, TIMELINES } from "../constants";
import type { FormState } from "../types";
import { Inp, Lbl, ToggleCard } from "./FormPrimitives";

interface StepProps {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function Step4Motivation({ form, set }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
          Motivation & Deal Preferences
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Help buyers understand your situation to receive better, faster offers.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-sm">
        <div>
          <Lbl label="Desired Timeline" hint="How soon do you need to close?" />

          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TIMELINES.map((timeline) => (
              <button
                key={timeline}
                type="button"
                onClick={() => set("timeline", timeline)}
                className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  form.timeline === timeline
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/50"
                }`}
              >
                <Clock
                  className={`h-5 w-5 ${
                    form.timeline === timeline
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />

                <span
                  className={`text-sm font-bold ${
                    form.timeline === timeline
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-main)]"
                  }`}
                >
                  {timeline}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-5">
          <Lbl label="Primary Reason for Selling" />

          <div className="mt-1 flex flex-wrap gap-2">
            {SELL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => set("reason", reason)}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                  form.reason === reason
                    ? "bg-[var(--color-secondary)] text-[var(--color-primary-dark)]"
                    : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-secondary)]"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 border-t border-[var(--color-border-light)] pt-5 sm:grid-cols-2">
          <div>
            <Lbl label="Realtor Commission %" />

            <Inp
              value={form.realtorCommission}
              onChange={(value) => set("realtorCommission", value)}
              placeholder="2.5"
              type="number"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <ToggleCard
                checked={form.proofOfFundsRequired}
                onToggle={() =>
                  set("proofOfFundsRequired", !form.proofOfFundsRequired)
                }
                label="Proof of Funds Required"
                sub="Require buyers to prove funds before bidding"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

          <div>
            <p className="text-sm font-black text-[var(--color-primary)]">
              Draft First, Pictures Next
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              This form creates your property listing as a draft. After that,
              you will upload 1 to 10 property pictures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
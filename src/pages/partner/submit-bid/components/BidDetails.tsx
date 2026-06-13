import type { BidFormState } from "../types";
import { BUYER_TYPES, CONTINGENCY_OPTIONS } from "../constants";

interface BidDetailsProps {
  form: BidFormState;
  fieldErrors: Record<string, string>;
  set: <K extends keyof BidFormState>(key: K, value: BidFormState[K]) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[11px] font-semibold text-[var(--color-danger)]">
      {message}
    </p>
  );
}

export default function BidDetails({ form, fieldErrors, set }: BidDetailsProps) {
  const toggleContingency = (value: string) => {
    const current = form.contingencies;
    if (current.includes(value)) {
      set("contingencies", current.filter((c) => c !== value));
    } else {
      set("contingencies", [...current, value]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 1 of 3
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">
          Your Offer
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Enter your bid amount and purchase terms. All figures are reviewed by
          the seller.
        </p>
      </div>

      {/* Offer Amount */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
            Offer Amount (USD) <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]">
            <span className="text-sm font-black text-[var(--color-secondary)]">$</span>
            <input
              type="number"
              min="0"
              value={form.offerAmount}
              onChange={(e) => set("offerAmount", e.target.value)}
              placeholder="e.g. 420000"
              className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none"
            />
          </div>
          <FieldError message={fieldErrors.offerAmount} />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
            Earnest Money Deposit (USD) <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]">
            <span className="text-sm font-black text-[var(--color-secondary)]">$</span>
            <input
              type="number"
              min="0"
              value={form.earnestMoney}
              onChange={(e) => set("earnestMoney", e.target.value)}
              placeholder="e.g. 5000"
              className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none"
            />
          </div>
          <FieldError message={fieldErrors.earnestMoney} />
        </div>
      </div>

      {/* Buyer Type */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Buyer Type <span className="text-[var(--color-danger)]">*</span>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BUYER_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => set("buyerType", type.value)}
              className={`rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                form.buyerType === type.value
                  ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <FieldError message={fieldErrors.buyerType} />
      </div>

      {/* Contingencies */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Contingencies
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Select all that apply. Clean offers (no contingencies) are more competitive.
        </p>
        <div className="mt-3 space-y-2">
          {CONTINGENCY_OPTIONS.map((option) => {
            const isSelected = form.contingencies.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleContingency(option.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/8 text-white"
                    : "border-white/8 bg-white/[0.03] text-white/50 hover:border-white/15 hover:text-white/70"
                }`}
              >
                <div
                  className={`h-4 w-4 flex-shrink-0 rounded border transition-all ${
                    isSelected
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]"
                      : "border-white/20"
                  }`}
                />
                <span className="text-[12px] font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

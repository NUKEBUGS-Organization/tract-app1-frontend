import type { BidFormState } from "../types";
import { CLOSE_TIMELINES } from "../constants";

interface DueDiligenceProps {
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

export default function DueDiligence({ form, fieldErrors, set }: DueDiligenceProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 2 of 3
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">
          Due Diligence Terms
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Define your inspection timeline and closing preferences.
        </p>
      </div>

      {/* Closing Timeline */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Closing Timeline <span className="text-[var(--color-danger)]">*</span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {CLOSE_TIMELINES.map((timeline) => (
            <button
              key={timeline}
              type="button"
              onClick={() => set("closingTimeline", timeline)}
              className={`rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                form.closingTimeline === timeline
                  ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
              }`}
            >
              {timeline}
            </button>
          ))}
        </div>
        <FieldError message={fieldErrors.closingTimeline} />
      </div>

      {/* Inspection Period */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Inspection Period (Days) <span className="text-[var(--color-danger)]">*</span>
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Number of business days you need for inspection. Enter 0 for waived.
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]">
          <input
            type="number"
            min="0"
            max="30"
            value={form.inspectionPeriodDays}
            onChange={(e) => set("inspectionPeriodDays", e.target.value)}
            placeholder="e.g. 10"
            className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none"
          />
          <span className="shrink-0 text-[11px] font-semibold text-white/40">days</span>
        </div>
        <FieldError message={fieldErrors.inspectionPeriodDays} />
      </div>

      {/* Proof of Funds Note */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Proof of Funds Note
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Briefly describe your proof of funds status (bank statement, LOC, etc.).
        </p>
        <input
          type="text"
          value={form.proofOfFundsNote}
          onChange={(e) => set("proofOfFundsNote", e.target.value)}
          placeholder="e.g. Bank statement on file, LOC available"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-[var(--color-secondary)]"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Additional Notes
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Any additional information for the seller (flexible on terms, can close faster, etc.).
        </p>
        <textarea
          rows={4}
          value={form.additionalNotes}
          onChange={(e) => set("additionalNotes", e.target.value)}
          placeholder="Optional notes to the seller..."
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-[var(--color-secondary)]"
        />
      </div>
    </div>
  );
}

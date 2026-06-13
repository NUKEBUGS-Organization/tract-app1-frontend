import { CheckCircle2, DollarSign, FileCheck2 } from "lucide-react";
import type { BidFormState } from "../types";
import { BUYER_TYPES, CONTINGENCY_OPTIONS } from "../constants";

interface SubmitBidProps {
  form: BidFormState;
  propertyLabel?: string;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function formatMoney(value: string) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getLabel<T extends { value: string; label: string }>(
  list: T[],
  value: string
) {
  return list.find((item) => item.value === value)?.label ?? value ?? "—";
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3">
      <div className="flex items-center gap-2 text-white/50">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <span className="text-right text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export default function SubmitBid({
  form,
  propertyLabel,
  isSubmitting,
  onSubmit,
}: SubmitBidProps) {
  const contingencyLabels =
    form.contingencies.length > 0
      ? form.contingencies
          .map((c) => getLabel(CONTINGENCY_OPTIONS, c))
          .join(", ")
      : "None (Clean Offer)";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 3 of 3
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">
          Review & Submit
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Review your offer details before submission. Once submitted, the seller
          will be notified.
        </p>
      </div>

      {/* Property label */}
      {propertyLabel && (
        <div className="rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 px-5 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Property
          </p>
          <p className="mt-1 text-sm font-bold text-white">{propertyLabel}</p>
        </div>
      )}

      {/* Bid Summary */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
          Bid Summary
        </p>
        <div className="space-y-0">
          <ReviewRow
            icon={DollarSign}
            label="Offer Amount"
            value={formatMoney(form.offerAmount)}
          />
          <ReviewRow
            icon={DollarSign}
            label="Earnest Money"
            value={formatMoney(form.earnestMoney)}
          />
          <ReviewRow
            icon={DollarSign}
            label="Buyer Type"
            value={getLabel(BUYER_TYPES, form.buyerType)}
          />
          <ReviewRow
            icon={FileCheck2}
            label="Contingencies"
            value={contingencyLabels}
          />
          <ReviewRow
            icon={FileCheck2}
            label="Closing Timeline"
            value={form.closingTimeline || "—"}
          />
          <ReviewRow
            icon={FileCheck2}
            label="Inspection Period"
            value={
              form.inspectionPeriodDays
                ? `${form.inspectionPeriodDays} days`
                : "—"
            }
          />
          {form.proofOfFundsNote && (
            <ReviewRow
              icon={CheckCircle2}
              label="Proof of Funds"
              value={form.proofOfFundsNote}
            />
          )}
        </div>
      </div>

      {/* Notes */}
      {form.additionalNotes && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Additional Notes
          </p>
          <p className="text-sm text-white/70 leading-6">{form.additionalNotes}</p>
        </div>
      )}

      {/* Terms notice */}
      <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-5 py-4">
        <p className="text-[11px] leading-5 text-[var(--color-warning)]/80">
          ⚠️ By submitting this bid, you agree to TRACT's offer terms. Failing
          to close after a seller accepts may impact your Reliability Score.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-3 bg-[var(--color-secondary)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-dark-main)] border-t-transparent" />
            Submitting Bid...
          </>
        ) : (
          <>
            <DollarSign className="h-4 w-4" />
            Submit Offer
          </>
        )}
      </button>
    </div>
  );
}

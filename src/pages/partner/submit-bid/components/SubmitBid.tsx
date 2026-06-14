import { CheckCircle2, Clock, DollarSign, FileCheck2, FileText, Link } from "lucide-react";
import type { BidFormState } from "../types";

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

function ReviewRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3.5">
      <div className="flex items-center gap-2 text-white/50">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <span
        className={`text-right text-sm font-bold ${highlight ? "text-[var(--color-secondary)]" : "text-white"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SubmitBid({
  form,
  propertyLabel,
  isSubmitting,
  onSubmit,
}: SubmitBidProps) {
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
          Review your bid before submission. The seller will see your bid price,
          inspection period, Reliability Score, and Net-to-Seller value.
        </p>
      </div>

      {/* Property */}
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
        <div>
          <ReviewRow
            icon={DollarSign}
            label="Bid Price"
            value={formatMoney(form.bid_price)}
            highlight
          />
          <ReviewRow
            icon={Clock}
            label="Inspection Period"
            value={form.inspection_period ? `${form.inspection_period} Days` : "—"}
          />
          <ReviewRow
            icon={FileCheck2}
            label="Due Diligence Period"
            value={
              form.due_diligence_period
                ? `${form.due_diligence_period} Business Days`
                : "—"
            }
          />
          {form.loi_url && (
            <ReviewRow
              icon={Link}
              label="LOI Document"
              value="Attached ✓"
            />
          )}
          {form.proof_of_funds_url && (
            <ReviewRow
              icon={FileText}
              label="Proof of Funds"
              value="Attached ✓"
            />
          )}
        </div>
      </div>

      {/* What seller sees */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Bid Price", value: formatMoney(form.bid_price) },
          {
            label: "Inspection Period",
            value: form.inspection_period ? `${form.inspection_period}d` : "—",
          },
          { label: "Reliability Score", value: "Shown to seller ✓" },
          { label: "Net-to-Seller", value: "Auto-calculated ✓" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--color-secondary)]/15 bg-[var(--color-secondary)]/5 p-3 text-center"
          >
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/60">
              {item.label}
            </p>
            <p className="mt-1 text-[11px] font-bold text-white/70">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* 72h warning */}
      <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-5 py-4">
        <p className="text-[11px] leading-5 text-[var(--color-warning)]/80">
          ⚠️ By submitting this bid, you agree to TRACT's offer terms. If
          selected, you have{" "}
          <strong className="text-[var(--color-warning)]">72 hours</strong> to
          upload active marketing proof. Failure to close after seller
          acceptance will impact your Reliability Score.
        </p>
      </div>

      {/* Submit */}
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
            <CheckCircle2 className="h-4 w-4" />
            Submit Offer
          </>
        )}
      </button>
    </div>
  );
}

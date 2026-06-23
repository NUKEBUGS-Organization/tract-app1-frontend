import { CheckCircle2, Clock, DollarSign, FileCheck2, FileText, Link } from "lucide-react";
import type { BidFormState } from "../types";
import { usePartnerTheme } from "../../../../hooks/usePartnerTheme";

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
  isDark,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b py-3.5 ${isDark ? "border-white/8" : "border-[var(--color-border-light)]"
        }`}
    >
      <div
        className={`flex items-center gap-2 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
          }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <span
        className={`text-right text-sm font-bold ${highlight
          ? "text-[var(--color-secondary)]"
          : isDark
            ? "text-white"
            : "text-[var(--color-text-main)]"
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
  const isDark = usePartnerTheme() === "dark";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 3 of 3
        </p>
        <h2
          className={`mt-1 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Review & Submit
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Review your bid before submission. The seller will see your bid price,
          inspection period, Reliability Score, and Net-to-Seller value.
        </p>
      </div>

      {/* Property */}
      {propertyLabel && (
        <div
          className={`rounded-xl border px-5 py-3 ${isDark
            ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
            : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
            }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Property
          </p>
          {/* <p
            className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {propertyLabel}
          </p> */}
        </div>
      )}

      {/* Bid Summary */}
      <div
        className={`rounded-2xl border p-6 ${isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
          }`}
      >
        <p
          className={`mb-4 text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          Bid Summary
        </p>
        <div>
          <ReviewRow
            icon={DollarSign}
            label="Bid Price"
            value={formatMoney(form.bid_price)}
            highlight
            isDark={isDark}
          />
          <ReviewRow
            icon={Clock}
            label="Inspection Period"
            value={form.inspection_period ? `${form.inspection_period} Days` : "—"}
            isDark={isDark}
          />
          <ReviewRow
            icon={FileCheck2}
            label="Due Diligence Period"
            value={
              form.due_diligence_period
                ? `${form.due_diligence_period} Business Days`
                : "—"
            }
            isDark={isDark}
          />
          {form.loi_url && (
            <ReviewRow
              icon={Link}
              label="LOI Document"
              value="Attached ✓"
              isDark={isDark}
            />
          )}
          {form.proof_of_funds_url && (
            <ReviewRow
              icon={FileText}
              label="Proof of Funds"
              value="Attached ✓"
              isDark={isDark}
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
            className={`rounded-xl border p-3 text-center ${isDark
              ? "border-[var(--color-secondary)]/15 bg-[var(--color-secondary)]/5"
              : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
              }`}
          >
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/60">
              {item.label}
            </p>
            <p
              className={`mt-1 text-[11px] font-bold ${isDark ? "text-white/70" : "text-[var(--color-text-main)]"
                }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* 72h warning */}
      <div
        className={`rounded-xl border px-5 py-4 ${isDark
          ? "border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5"
          : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
          }`}
      >
        <p
          className={`text-[11px] leading-5 ${isDark
            ? "text-[var(--color-warning)]/80"
            : "text-[var(--color-text-muted)]"
            }`}
        >
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
        className="flex w-full items-center justify-center gap-3 bg-[var(--color-secondary)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
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
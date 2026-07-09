import { ChevronLeft } from "lucide-react";
import type { OfferFormState } from "../types";

// ─── Utility (local to this step) ────────────────────────────────────────────

// Mirrors backend: only deduct commission when seller pays
function calcNetToSeller(
  price: number,
  commissionPct: number,
  paymentSource: string
): number {
  if (paymentSource === "Seller Pays Commission") {
    return price - price * (commissionPct / 100);
  }
  return price; // Buyer pays — seller keeps full amount
}

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReviewSubmitProps {
  form: OfferFormState;
  parsedOfferPrice: number;
  propertyLabel: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  isDark: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewSubmit({
  form,
  parsedOfferPrice,
  propertyLabel,
  isSubmitting,
  onSubmit,
  onBack,
  isDark,
}: ReviewSubmitProps) {
  const sellerPays = form.payment_source === "Seller Pays Commission";
  const netToSeller =
    parsedOfferPrice > 0
      ? calcNetToSeller(parsedOfferPrice, form.commission_pct, form.payment_source)
      : 0;

  // Build the rows for the summary table
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Property",           value: propertyLabel },
    { label: "Proposed Sale Price", value: formatMoney(parsedOfferPrice) },
    { label: "Closing Timeline",   value: `${form.closing_timeline_days} Days` },
    {
      label: "Commission",
      value: sellerPays
        ? `${form.commission_pct}% (Seller pays)`
        : `${form.commission_pct}% (Buyer pays)`,
    },
    { label: "Net-to-Seller",      value: formatMoney(netToSeller), highlight: true },
    { label: "Agency Role",        value: form.agency_role },
    { label: "Payment Source",     value: form.payment_source },
  ];

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2
          className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Review Your Offer
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Review the details below before submitting to the seller.
        </p>
      </div>

      {/* Summary rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between rounded-xl border px-5 py-4 ${row.highlight
                ? isDark
                  ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                  : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                : isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
              }`}
          >
            <span
              className={`text-sm ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
                }`}
            >
              {row.label}
            </span>
            <span
              className={`text-sm font-black ${row.highlight
                  ? isDark
                    ? "text-[#d4af37]"
                    : "text-[var(--color-secondary)]"
                  : isDark
                    ? "text-white"
                    : "text-[var(--color-primary)]"
                }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* 7-Day Market Launch Rule warning */}
      <div
        className={`rounded-xl border px-5 py-4 ${isDark
            ? "border-yellow-500/30 bg-yellow-500/10"
            : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
          }`}
      >
        <p
          className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? "text-yellow-500" : "text-[var(--color-warning)]"
            }`}
        >
          ⚠ 7-Day Market Launch Rule
        </p>
        <p
          className={`mt-1.5 text-xs leading-5 ${isDark ? "text-yellow-500/80" : "text-[var(--color-text-muted)]"
            }`}
        >
          If the seller selects you, you must upload proof of marketing within{" "}
          <strong>7 days</strong>. Failure to do so activates the Kill Switch
          and promotes the Backup Partner.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50 ${isDark ? "bg-[#d4af37] text-black" : "bg-[var(--color-primary)] text-white"
          }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Representation Offer"}
      </button>

      {/* Back button */}
      <div
        className={`border-t pt-4 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"
          }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 border px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
              ? "border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Edit Offer
        </button>
      </div>
    </div>
  );
}

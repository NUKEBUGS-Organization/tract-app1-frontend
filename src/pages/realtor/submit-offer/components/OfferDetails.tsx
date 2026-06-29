import { DollarSign } from "lucide-react";
import { TIMELINE_OPTIONS } from "../constants";
import type { OfferFormState } from "../types";

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

interface OfferDetailsProps {
  offerPrice: OfferFormState["offer_price"];
  onOfferPriceChange: (val: string) => void;
  timeline: OfferFormState["closing_timeline_days"];
  onTimelineChange: (val: 30 | 45 | 60) => void;
  askingPrice: number;
  fieldErrors: Record<string, string>;
  isDark: boolean;
}

export default function OfferDetails({
  offerPrice,
  onOfferPriceChange,
  timeline,
  onTimelineChange,
  askingPrice,
  fieldErrors,
  isDark,
}: OfferDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2
          className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Offer Details
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Enter your proposed sale price and closing timeline.
        </p>
      </div>

      {/* Seller's asking price — read-only reference banner */}
      {askingPrice > 0 && (
        <div
          className={`rounded-xl border px-5 py-4 ${isDark
              ? "border-[#d4af37]/30 bg-[#d4af37]/10"
              : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
            }`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-[#d4af37]/70" : "text-[var(--color-secondary)]/70"
              }`}
          >
            Seller's Asking Price
          </p>
          <p
            className={`mt-1 text-2xl font-black ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
              }`}
          >
            {formatMoney(askingPrice)}
          </p>
        </div>
      )}

      {/* Offer price input */}
      <div>
        <label
          className={`mb-2 block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          Proposed Sale Price *
        </label>
        <div className="relative">
          <DollarSign
            className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          />
          <input
            id="offer-price-input"
            type="number"
            value={offerPrice}
            onChange={(e) => onOfferPriceChange(e.target.value)}
            placeholder="e.g. 350000"
            className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm font-bold outline-none transition focus:ring-2 ${fieldErrors.offer_price
                ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                : isDark
                  ? "border-white/20 bg-white/5 text-white focus:border-[#d4af37] focus:ring-[#d4af37]/10"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
              }`}
          />
        </div>
        {fieldErrors.offer_price && (
          <p className="mt-1.5 text-xs font-semibold text-[var(--color-danger)]">
            {fieldErrors.offer_price}
          </p>
        )}
      </div>

      {/* Closing timeline selector */}
      <div>
        <label
          className={`mb-3 block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          Estimated Closing Timeline
        </label>
        <div className="flex flex-wrap gap-3">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTimelineChange(opt.value)}
              className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${timeline === opt.value
                  ? isDark
                    ? "border-[#d4af37] bg-[#d4af37] text-black shadow-lg"
                    : "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                  : isDark
                    ? "border-white/20 bg-white/5 text-white/50 hover:border-[#d4af37] hover:text-[#d4af37]"
                    : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

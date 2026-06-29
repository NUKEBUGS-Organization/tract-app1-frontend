import { AGENCY_ROLES, COMMISSION_MIN, COMMISSION_MAX, COMMISSION_STEP, PAYMENT_SOURCES } from "../constants";
import type { OfferFormState } from "../types";

// ─── Utility helpers (local to this step) ────────────────────────────────────

function calcNetToSeller(price: number, commissionPct: number): number {
  return price - price * (commissionPct / 100);
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

interface ProfessionalSetupProps {
  commissionPct: OfferFormState["commission_pct"];
  onCommissionChange: (val: number) => void;
  agencyRole: OfferFormState["agency_role"];
  onAgencyRoleChange: (val: string) => void;
  paymentSource: OfferFormState["payment_source"];
  onPaymentSourceChange: (val: string) => void;
  /** Parsed offer price (number) — used to compute net-to-seller live */
  parsedOfferPrice: number;
  fieldErrors: Record<string, string>;
  isDark: boolean;
}

// ─── Reusable selector row ────────────────────────────────────────────────────

function OptionGroup({
  label,
  options,
  selected,
  onSelect,
  isDark,
}: {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (v: string) => void;
  isDark: boolean;
}) {
  return (
    <div>
      <label
        className={`mb-3 block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
          }`}
      >
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${selected === opt
                ? isDark
                  ? "border-[#d4af37] bg-[#d4af37] text-black shadow-lg"
                  : "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                : isDark
                  ? "border-white/20 bg-white/5 text-white/50 hover:border-[#d4af37] hover:text-[#d4af37]"
                  : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfessionalSetup({
  commissionPct,
  onCommissionChange,
  agencyRole,
  onAgencyRoleChange,
  paymentSource,
  onPaymentSourceChange,
  parsedOfferPrice,
  fieldErrors,
  isDark,
}: ProfessionalSetupProps) {
  const netToSeller =
    parsedOfferPrice > 0 ? calcNetToSeller(parsedOfferPrice, commissionPct) : 0;

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2
          className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Professional Setup
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Configure your commission structure. The Net-to-Seller is calculated
          automatically.
        </p>
      </div>

      {/* Commission % — slider + numeric input, any value 2–6% */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label
            className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            Commission Percentage
          </label>
          {/* Numeric input — allows typing exact value */}
          <div className="relative flex items-center">
            <input
              type="number"
              min={COMMISSION_MIN}
              max={COMMISSION_MAX}
              step={COMMISSION_STEP}
              value={commissionPct}
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                if (!isNaN(raw)) onCommissionChange(raw);
              }}
              onBlur={(e) => {
                // Clamp to valid range on blur
                const clamped = Math.min(
                  COMMISSION_MAX,
                  Math.max(COMMISSION_MIN, parseFloat(e.target.value) || COMMISSION_MIN)
                );
                onCommissionChange(Math.round(clamped * 100) / 100);
              }}
              className={`w-20 rounded-xl border py-2 pr-6 text-center text-sm font-black outline-none transition focus:ring-2 ${isDark
                  ? "border-[#d4af37]/40 bg-white/5 text-[#d4af37] focus:border-[#d4af37] focus:ring-[#d4af37]/10"
                  : "border-[var(--color-secondary)]/40 bg-[var(--color-bg-soft)] text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                }`}
            />
            <span
              className={`pointer-events-none absolute right-2 text-xs font-black ${isDark ? "text-[#d4af37]/60" : "text-[var(--color-primary)]/60"
                }`}
            >
              %
            </span>
          </div>
        </div>

        {/* Range slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={COMMISSION_MIN}
            max={COMMISSION_MAX}
            step={COMMISSION_STEP}
            value={commissionPct}
            onChange={(e) => onCommissionChange(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-[var(--color-secondary)]"
          />
          {/* Min / Max labels */}
          <div className="flex justify-between">
            <span className={`text-[10px] font-black ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
              {COMMISSION_MIN}%
            </span>
            <span className={`text-[10px] font-semibold ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
              Any value between {COMMISSION_MIN}% – {COMMISSION_MAX}%
            </span>
            <span className={`text-[10px] font-black ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
              {COMMISSION_MAX}%
            </span>
          </div>
        </div>

        {fieldErrors.commission_pct && (
          <p className="mt-1.5 text-xs font-semibold text-[var(--color-danger)]">
            {fieldErrors.commission_pct}
          </p>
        )}
      </div>

      {/* Transparency Engine — live Net-to-Seller calculator */}
      {parsedOfferPrice > 0 && (
        <div
          className={`rounded-xl border p-5 ${isDark
              ? "border-[#d4af37]/20 bg-[#d4af37]/5"
              : "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
            }`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
              }`}
          >
            Transparency Engine — Seller View
          </p>

          <div className="mt-3 space-y-2">
            {/* Offer price row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isDark ? "text-white/70" : "text-[var(--color-text-muted)]"
                  }`}
              >
                Your Offer Price
              </span>
              <span
                className={`text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
              >
                {formatMoney(parsedOfferPrice)}
              </span>
            </div>

            {/* Commission row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isDark ? "text-white/70" : "text-[var(--color-text-muted)]"
                  }`}
              >
                Commission ({commissionPct}%)
              </span>
              <span
                className={`text-sm font-black ${isDark ? "text-red-400" : "text-[var(--color-danger)]"
                  }`}
              >
                −{formatMoney(parsedOfferPrice * (commissionPct / 100))}
              </span>
            </div>

            {/* Divider + Net-to-Seller */}
            <div
              className={`border-t pt-2 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"
                }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                    }`}
                >
                  Net-to-Seller
                </span>
                <span
                  className={`text-lg font-black ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                    }`}
                >
                  {formatMoney(netToSeller)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Role */}
      <OptionGroup
        label="Agency Role"
        options={AGENCY_ROLES}
        selected={agencyRole}
        onSelect={onAgencyRoleChange}
        isDark={isDark}
      />

      {/* Payment Source */}
      <OptionGroup
        label="Payment Source"
        options={PAYMENT_SOURCES}
        selected={paymentSource}
        onSelect={onPaymentSourceChange}
        isDark={isDark}
      />
    </div>
  );
}

import { AlertCircle, DollarSign, ShieldAlert } from "lucide-react";
import type { BidFormState } from "../types";
import { usePartnerTheme } from "../../../../hooks/usePartnerTheme";

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

interface BidDetailsProps {
  form: BidFormState;
  fieldErrors: Record<string, string>;
  set: <K extends keyof BidFormState>(key: K, value: BidFormState[K]) => void;
  askingPrice?: number;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-danger)]">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

export default function BidDetails({
  form,
  fieldErrors,
  set,
  askingPrice,
}: BidDetailsProps) {
  const isDark = usePartnerTheme() === "dark";
  const offerNum = Number(form.bid_price);
  const hasAmount = form.bid_price !== "" && offerNum > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 1 of 3
        </p>
        <h2
          className={`mt-1 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Your Bid Price
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Enter the price you are offering for this property. This is what the
          seller will see alongside your Reliability Score.
        </p>
      </div>

      {/* Seller's asking price — read-only reference banner */}
      {askingPrice !== undefined && askingPrice > 0 && (
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

      {/* Bid Price */}
      <div>
        <label
          className={`block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Bid Price (USD) <span className="text-[var(--color-danger)]">*</span>
        </label>

        <div
          className={`mt-3 flex items-center gap-4 rounded-2xl border-2 px-6 py-5 transition-all ${isDark
            ? fieldErrors.bid_price
              ? "border-[var(--color-danger)]/60"
              : hasAmount
                ? "border-[var(--color-secondary)] shadow-[0_0_0_4px_rgba(212,175,55,0.08)]"
                : "border-white/10 focus-within:border-[var(--color-secondary)]"
            : fieldErrors.bid_price
              ? "border-[var(--color-danger)]/60"
              : hasAmount
                ? "border-[var(--color-secondary)] shadow-[0_0_0_4px_rgba(212,175,55,0.08)]"
                : "border-[var(--color-border-light)] focus-within:border-[var(--color-secondary)]"
            }`}
          style={{
            background: isDark ? "rgba(255,255,255,0.04)" : "var(--color-bg-soft)",
          }}
        >
          <DollarSign
            className={`h-7 w-7 shrink-0 ${hasAmount ? "text-[var(--color-secondary)]" : isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
              }`}
          />
          <input
            type="number"
            min="1"
            value={form.bid_price}
            onChange={(e) => set("bid_price", e.target.value)}
            placeholder="0"
            className={`w-full bg-transparent font-serif text-3xl font-black outline-none ${isDark
              ? "text-white placeholder-white/15"
              : "text-[var(--color-primary)] placeholder-[var(--color-text-muted)]/50"
              }`}
          />
          <span
            className={`shrink-0 text-[12px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]/60"
              }`}
          >
            USD
          </span>
        </div>

        {hasAmount && (
          <p
            className={`mt-2 text-[12px] font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            ={" "}
            <span className="font-black text-[var(--color-secondary)]">
              {offerNum.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </span>
          </p>
        )}

        <FieldError message={fieldErrors.bid_price} />
      </div>

      {/* What seller will see */}
      <div
        className={`rounded-2xl border p-5 ${isDark
          ? "border-white/8 bg-white/[0.03]"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
          }`}
      >
        <p
          className={`mb-4 text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
            }`}
        >
          What the Seller Will See
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Bid Price",
              value: hasAmount
                ? offerNum.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })
                : "Your amount",
              highlight: true,
            },
            { label: "Inspection Period", value: "Set in step 2", highlight: false },
            { label: "Reliability Score", value: "Your score", highlight: false },
            { label: "Net-to-Seller", value: "Auto-calculated", highlight: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-3 text-center ${item.highlight
                ? isDark
                  ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/8"
                  : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                : isDark
                  ? "border-white/6 bg-white/[0.02]"
                  : "border-[var(--color-border-light)] bg-white"
                }`}
            >
              <p
                className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                  }`}
              >
                {item.label}
              </p>
              <p
                className={`mt-1 text-[12px] font-black ${item.highlight
                  ? "text-[var(--color-secondary)]"
                  : isDark
                    ? "text-white/50"
                    : "text-[var(--color-text-muted)]"
                  }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-circumvention */}
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${isDark
          ? "border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5"
          : "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5"
          }`}
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]/70" />
        <p
          className={`text-[11px] leading-5 ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          No contact details are shared with the seller at this stage. Direct
          communication is not permitted until a contract is signed by both
          parties.
        </p>
      </div>
    </div>
  );
}
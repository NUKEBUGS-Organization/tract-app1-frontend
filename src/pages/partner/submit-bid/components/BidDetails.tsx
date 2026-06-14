import { AlertCircle, DollarSign, ShieldAlert } from "lucide-react";
import type { BidFormState } from "../types";

interface BidDetailsProps {
  form: BidFormState;
  fieldErrors: Record<string, string>;
  set: <K extends keyof BidFormState>(key: K, value: BidFormState[K]) => void;
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

export default function BidDetails({ form, fieldErrors, set }: BidDetailsProps) {
  const offerNum = Number(form.bid_price);
  const hasAmount = form.bid_price !== "" && offerNum > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 1 of 3
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">
          Your Bid Price
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Enter the price you are offering for this property. This is what the
          seller will see alongside your Reliability Score.
        </p>
      </div>

      {/* Hidden Reserve Notice
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-secondary)]" />
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-secondary)]">
            Hidden Reserve Price
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-white/60">
            Each listing has a hidden reserve price set by the seller. Bids
            below this threshold are{" "}
            <span className="font-bold text-[var(--color-danger)]">
              automatically rejected
            </span>
            . Bid with confidence.
          </p>
        </div>
      </div> */}

      {/* Bid Price */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Bid Price (USD) <span className="text-[var(--color-danger)]">*</span>
        </label>

        <div
          className={`mt-3 flex items-center gap-4 rounded-2xl border-2 bg-white/[0.04] px-6 py-5 transition-all ${fieldErrors.bid_price
            ? "border-[var(--color-danger)]/60"
            : hasAmount
              ? "border-[var(--color-secondary)] shadow-[0_0_0_4px_rgba(212,175,55,0.08)]"
              : "border-white/10 focus-within:border-[var(--color-secondary)]"
            }`}
        >
          <DollarSign
            className={`h-7 w-7 shrink-0 ${hasAmount ? "text-[var(--color-secondary)]" : "text-white/25"
              }`}
          />
          <input
            type="number"
            min="1"
            value={form.bid_price}
            onChange={(e) => set("bid_price", e.target.value)}
            placeholder="0"
            className="w-full bg-transparent font-serif text-3xl font-black text-white placeholder-white/15 outline-none"
          />
          <span className="shrink-0 text-[12px] font-black uppercase tracking-wider text-white/30">
            USD
          </span>
        </div>

        {/* Live dollar preview */}
        {hasAmount && (
          <p className="mt-2 text-[12px] font-semibold text-white/40">
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
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
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
                ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/8"
                : "border-white/6 bg-white/[0.02]"
                }`}
            >
              <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
                {item.label}
              </p>
              <p
                className={`mt-1 text-[12px] font-black ${item.highlight
                  ? "text-[var(--color-secondary)]"
                  : "text-white/50"
                  }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-circumvention */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]/70" />
        <p className="text-[11px] leading-5 text-white/40">
          No contact details are shared with the seller at this stage. Direct
          communication is not permitted until a contract is signed by both
          parties.
        </p>
      </div>
    </div>
  );
}

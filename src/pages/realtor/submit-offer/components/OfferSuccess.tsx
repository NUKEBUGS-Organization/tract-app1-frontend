import { CheckCircle2, Handshake } from "lucide-react";
import { Link } from "react-router";

interface OfferSuccessProps {
  propertyId: string;
  propertyLabel: string;
  isDark: boolean;
}

export default function OfferSuccess({
  propertyId,
  propertyLabel,
  isDark,
}: OfferSuccessProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        {/* Success icon */}
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isDark
              ? "bg-[#d4af37]/10 ring-4 ring-[#d4af37]/20"
              : "bg-[var(--color-secondary)]/15 ring-4 ring-[var(--color-secondary)]/20"
            }`}
        >
          <CheckCircle2
            className={`h-10 w-10 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
              }`}
          />
        </div>

        {/* Headline */}
        <h1
          className={`font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Offer Submitted!
        </h1>

        {/* Body text */}
        <p
          className={`mt-3 text-sm leading-6 ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Your representation offer for{" "}
          <span
            className={`font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {propertyLabel}
          </span>{" "}
          has been submitted. The seller will review your offer shortly.
        </p>

        {/* What happens next */}
        <div
          className={`mt-6 rounded-2xl border p-5 text-left ${isDark
              ? "border-[#d4af37]/30 bg-[#d4af37]/5"
              : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
            }`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
              }`}
          >
            What happens next?
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "Seller reviews your offer and commission structure",
              "You may be selected as Primary or Backup Partner",
              "Once selected, sign the listing agreement in-app",
              "Launch marketing within 7 days to avoid the Kill Switch",
            ].map((item) => (
              <li
                key={item}
                className={`flex items-start gap-2 text-[12px] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
                  }`}
              >
                <span
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? "bg-[#d4af37]" : "bg-[var(--color-secondary)]"
                    }`}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/my-bids"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
          >
            <Handshake className="h-4 w-4" />
            View My Offers
          </Link>

          <Link
            to={`/properties/${propertyId}`}
            className={`inline-flex items-center justify-center gap-2 border px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${isDark
                ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                : "border-[var(--color-border-light)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}
          >
            Back to Property
          </Link>
        </div>
      </div>
    </div>
  );
}

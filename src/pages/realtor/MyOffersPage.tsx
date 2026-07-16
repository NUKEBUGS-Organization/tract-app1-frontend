import { useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  History,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useGetMyBidsQuery, useDeleteOwnBidMutation } from "../../services/listingService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

function formatMoney(value: any) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function normalizeOffers(data: any): any[] {
  const raw: any = data;
  const payload = raw?.data ?? raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.bids)) return payload.bids;
  if (typeof payload === "object" && payload !== null) {
    return Object.values(payload).filter((item: any) =>
      Boolean(item && typeof item === "object" && (item._id || item.id))
    );
  }
  return [];
}

function getOfferStatus(bid: any): string {
  return String(bid?.status || "active").toLowerCase();
}

function getOfferStatusConfig(status: string) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ElementType }
  > = {
    active: {
      label: "Offer Pending",
      className:
        "bg-[var(--color-border-light)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]",
      icon: Clock,
    },
    selected: {
      label: "Selected — Listing Secured ✓",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: CheckCircle2,
    },
    backup: {
      label: "Backup Partner Queue",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: ShieldCheck,
    },
    rejected: {
      label: "Not Selected",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: XCircle,
    },
    deleted: {
      label: "Removed",
      className:
        "bg-[var(--color-border-light)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]",
      icon: XCircle,
    },
  };
  return map[status] ?? map.active;
}

// ─── Withdraw Confirm Modal ───────────────────────────────────────────────────
function WithdrawConfirmModal({
  open,
  address,
  isLoading,
  isDark,
  onConfirm,
  onClose,
}: {
  open: boolean;
  address: string;
  isLoading: boolean;
  isDark: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-md rounded-2xl border shadow-[0_25px_60px_rgba(0,0,0,0.45)] ${
          isDark
            ? "border-white/10 bg-[#0f0f14]"
            : "border-[var(--color-border-light)] bg-white"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b p-5 ${
          isDark ? "border-white/10" : "border-[var(--color-border-light)]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)]">
                Destructive Action
              </p>
              <h3 className={`mt-0.5 font-serif text-lg font-black ${
                isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}>
                Withdraw Offer
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`rounded-full p-2 transition ${
              isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
            }`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className={`text-sm leading-6 ${
            isDark ? "text-white/70" : "text-[var(--color-text-muted)]"
          }`}>
            You are about to withdraw your offer for{" "}
            <span className={`font-black ${
              isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}>
              {address}
            </span>.
          </p>

          <div className={`mt-4 space-y-2.5 rounded-xl border p-4 ${
            isDark
              ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/8"
              : "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5"
          }`}>
            {[
              "Your offer will be permanently removed.",
              "The seller will no longer see your submission.",
              "You can submit a new offer if the listing remains active.",
              "This action cannot be undone.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                <p className={`text-[12px] font-semibold leading-5 ${
                  isDark ? "text-white/65" : "text-[var(--color-text-main)]"
                }`}>
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 border-t p-5 ${
          isDark ? "border-white/10" : "border-[var(--color-border-light)]"
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 border py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition disabled:opacity-50 ${
              isDark
                ? "border-white/15 text-white/60 hover:bg-white/5"
                : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
            }`}
          >
            Keep Offer
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 bg-[var(--color-danger)] py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(220,38,38,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isLoading ? "Withdrawing..." : "Confirm — Withdraw Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// net_to_seller is computed by the backend at submission time — no frontend recalculation needed
// (backend only deducts commission when payment_source === "Seller Pays Commission")

function OfferCard({
  bid,
  isDark,
  onWithdraw,
  isWithdrawing,
}: {
  bid: any;
  isDark: boolean;
  onWithdraw?: (bidId: string, address: string) => void;
  isWithdrawing?: boolean;
}) {
  const status = getOfferStatus(bid);
  const config = getOfferStatusConfig(status);
  const StatusIcon = config.icon;
  const bidId = bid?._id || bid?.id;
  const isActionRequired = status === "selected" || status === "backup";
  const offerPrice = bid?.bid_price || bid?.amount;
  const commissionPct = bid?.commission_percentage;
  // Use the value already computed by the backend — it correctly handles
  // payment_source: only deducts when "Seller Pays Commission"
  const netToSeller: number | null =
    bid?.net_to_seller != null ? Number(bid.net_to_seller) : null;
  const paymentSource: string | null = bid?.payment_source ?? null;

  const listingAddress =
    bid?.listing?.address ||
    bid?.property_id?.address ||
    bid?.property_address ||
    "Property";
  const listingId =
    bid?.listing?._id || bid?.property_id?._id || bid?.listing_id || bid?.property_id;
  const listingCity = bid?.listing?.city || bid?.property_id?.city;
  const listingState = bid?.listing?.state_code || bid?.property_id?.state_code;
  const backupPosition = bid?.backup_position;
  const closingTimeline = bid?.closing_timeline_days;
  const agencyRole = bid?.agency_role;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isActionRequired
          ? isDark
            ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/8 shadow-[0_0_30px_rgba(212,175,55,0.12)]"
            : "border-[var(--color-secondary)]/40 bg-white shadow-[0_0_30px_rgba(212,175,55,0.12)]"
          : isDark
            ? "border-white/10 bg-white/[0.04] hover:border-[var(--color-secondary)]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)]"
            : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:shadow-xl hover:border-[var(--color-secondary)]/30"
        }`}
    >
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${isDark
            ? "bg-gradient-to-r from-[var(--color-secondary)] to-transparent"
            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
          }`}
      />
      {isActionRequired && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              {listingAddress}
            </p>
            {listingCity && (
              <p
                className={`mt-0.5 text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
              >
                {listingCity}
                {listingState ? `, ${listingState}` : ""}
              </p>
            )}
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${config.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </span>
        </div>

        {status === "backup" && backupPosition && (
          <p className="mt-2 text-[11px] font-semibold text-[var(--color-warning)]">
            Backup Partner #{backupPosition} — you'll be auto-promoted if the primary
            realtor is removed.
          </p>
        )}

        {/* Price + Net-to-Seller */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div
            className={`rounded-xl border p-3 ${isDark
                ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8"
                : "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8"
              }`}
          >
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
              Offer Price
            </p>
            <p className="mt-1 text-lg font-black text-[var(--color-secondary)]">
              {formatMoney(offerPrice)}
            </p>
          </div>
          {netToSeller && (
            <div
              className={`rounded-xl border p-3 ${isDark
                  ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10"
                  : "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
                }`}
            >
              <p
                className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
              >
                Net-to-Seller
              </p>
              <p
                className={`mt-1 text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
              >
                {formatMoney(netToSeller)}
              </p>
            </div>
          )}
        </div>

        {/* Details pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {commissionPct != null && (
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${isDark
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                }`}
            >
              <BadgeCheck className="h-3 w-3" />
              {commissionPct}%{" "}
              {paymentSource === "Buyer Pays Commission"
                ? "(Buyer pays)"
                : "(Seller pays)"}
            </span>
          )}
          {closingTimeline && (
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${isDark
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                }`}
            >
              <Clock className="h-3 w-3" />
              {closingTimeline}-Day Timeline
            </span>
          )}
          {agencyRole && (
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${isDark
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                }`}
            >
              <FileText className="h-3 w-3" />
              {agencyRole}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {listingId && (
            <Link
              to={`/properties/${listingId}`}
              className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${isDark
                  ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white hover:bg-white/10"
                  : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                }`}
            >
              View Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {status === "selected" && (
            <Link
              to={`/deals?listingId=${listingId}`}
              className={`flex items-center gap-1.5 bg-[var(--color-secondary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] ${
                isDark ? "hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]" : ""
              }`}
            >
              Go to Deal
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Withdraw button — only for pending (active) offers */}
          {status === "active" && onWithdraw && (
            <button
              type="button"
              onClick={() => onWithdraw(bidId, listingAddress)}
              disabled={isWithdrawing}
              className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition disabled:opacity-50 ${
                isDark
                  ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                  : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
              }`}
            >
              {isWithdrawing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Withdraw Offer
            </button>
          )}
        </div>

        {(bid?.submitted_at || bid?.created_at) && (
          <p
            className={`mt-3 text-[10px] ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
              }`}
          >
            Submitted{" "}
            {new Date(bid.submitted_at || bid.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RealtorMyOffersPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { data: bidsData, isLoading, refetch, isFetching } = useGetMyBidsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteOwnBid, { isLoading: isWithdrawing }] = useDeleteOwnBidMutation();

  const [withdrawModal, setWithdrawModal] = useState<{ open: boolean; bidId: string | null; address: string }>(
    { open: false, bidId: null, address: "" }
  );

  function openWithdrawModal(bidId: string, address: string) {
    setWithdrawModal({ open: true, bidId, address });
  }

  function closeWithdrawModal() {
    setWithdrawModal({ open: false, bidId: null, address: "" });
  }

  async function confirmWithdraw() {
    if (!withdrawModal.bidId) return;
    try {
      await deleteOwnBid(withdrawModal.bidId).unwrap();
      closeWithdrawModal();
      await refetch();
    } catch {
      // TODO: surface error toast
    }
  }

  const rawOffers = normalizeOffers(bidsData);

  // GET /bids/my-bids is already scoped to the authenticated user by the backend —
  // no client-side filter needed. The previous bidder_id filter caused all offers
  // to be silently dropped due to ObjectId format mismatches.
  const allOffers = rawOffers;

  const activeOffers = allOffers.filter((b) =>
    ["active", "selected"].includes(getOfferStatus(b)),
  );
  const pastOffers = allOffers.filter((b) =>
    ["backup", "rejected", "deleted"].includes(getOfferStatus(b)),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`relative overflow-hidden rounded-2xl p-8 ${isDark
            ? "bg-transparent border border-white/5"
            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90"
          }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.45)"
              } 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${isDark
              ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
              : "border-white/10"
            }`}
        />
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${isDark
              ? "border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
              : "border-[var(--color-secondary)]/20"
            }`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${isDark
                  ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                  : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"
                }`}
            >
              <Handshake
                className={`h-3 w-3 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                  }`}
              >
                Offer Tracker
              </span>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                My Offers
              </h1>
              <div
                className={`mt-1 h-0.5 w-16 rounded-full ${isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"
                  }`}
              />
            </div>
            <p
              className={`mt-4 max-w-xl text-sm leading-relaxed ${isDark ? "text-white/60" : "text-white/70"
                }`}
            >
              Track every representation offer you've submitted to sellers across the
              platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active Offers", value: isLoading ? "—" : activeOffers.length, icon: Clock },
              { label: "Past Offers", value: isLoading ? "—" : pastOffers.length, icon: History },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                  }`}
              >
                <stat.icon
                  className={`h-5 w-5 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`}
                />
                <div>
                  <p
                    className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"
                      }`}
                  >
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${isDark
                  ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-[#d4af37]/30"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2
              className={`mx-auto h-8 w-8 animate-spin ${isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
                }`}
            />
            <p
              className={`mt-3 text-sm font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
            >
              Loading your offers...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && activeOffers.length === 0 && pastOffers.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center ${isDark
              ? "border-white/8 bg-white/[0.03]"
              : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            }`}
        >
          <Handshake
            className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
              }`}
          />
          <p
            className={`mt-3 text-sm font-bold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            You haven't submitted any representation offers yet.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
          >
            Browse Seller Opportunities →
          </Link>
        </div>
      )}

      {/* Active Offers */}
      {!isLoading && activeOffers.length > 0 && (
        <div>
          <p
            className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            Active Offers ({activeOffers.length})
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {activeOffers.map((bid: any) => {
              const bidId = bid?._id || bid?.id;
              return (
                <OfferCard
                  key={String(bidId)}
                  bid={bid}
                  isDark={isDark}
                  onWithdraw={openWithdrawModal}
                  isWithdrawing={withdrawModal.bidId === bidId && isWithdrawing}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Past Offers */}
      {!isLoading && pastOffers.length > 0 && (
        <div className="mt-6">
          <p
            className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            Past Offers ({pastOffers.length})
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {pastOffers.map((bid: any) => (
              <OfferCard key={String(bid?._id || bid?.id)} bid={bid} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Confirm Modal */}
      <WithdrawConfirmModal
        open={withdrawModal.open}
        address={withdrawModal.address}
        isLoading={isWithdrawing}
        isDark={isDark}
        onConfirm={confirmWithdraw}
        onClose={closeWithdrawModal}
      />
    </div>
  );
}

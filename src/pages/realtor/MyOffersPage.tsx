import { Link } from "react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  History,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useGetMyBidsQuery } from "../../services/listingService";

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
  // Do NOT fall back to Object.values — response objects are not offers
  return [];
}

function getOfferStatus(bid: any): string {
  return String(bid?.status || "").toLowerCase();
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

function calcNetToSeller(price: number, commissionPct: number): number {
  return price - price * (commissionPct / 100);
}

function OfferCard({ bid }: { bid: any }) {
  const status = getOfferStatus(bid);
  const config = getOfferStatusConfig(status);
  const StatusIcon = config.icon;

  const isActionRequired = status === "selected" || status === "backup";
  const offerPrice = bid?.bid_price || bid?.amount;
  const commissionPct = bid?.commission_percentage || 2.5;
  const netToSeller =
    offerPrice ? calcNetToSeller(Number(offerPrice), commissionPct) : null;

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
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isActionRequired
          ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]"
          : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-secondary)]/30"
      }`}
    >
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500 group-hover:w-full" />
      {isActionRequired && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[var(--color-primary)]">
              {listingAddress}
            </p>
            {listingCity && (
              <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
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
          <div className="rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8 p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
              Offer Price
            </p>
            <p className="mt-1 text-lg font-black text-[var(--color-secondary)]">
              {formatMoney(offerPrice)}
            </p>
          </div>
          {netToSeller && (
            <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                Net-to-Seller
              </p>
              <p className="mt-1 text-lg font-black text-[var(--color-primary)]">
                {formatMoney(netToSeller)}
              </p>
            </div>
          )}
        </div>

        {/* Details pills */}
        <div className="mt-3 flex flex-wrap gap-3">
          {commissionPct && (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-bold text-[var(--color-text-muted)]">
              <BadgeCheck className="h-3 w-3" />
              {commissionPct}% Commission
            </span>
          )}
          {closingTimeline && (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-bold text-[var(--color-text-muted)]">
              <Clock className="h-3 w-3" />
              {closingTimeline}-Day Timeline
            </span>
          )}
          {agencyRole && (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-bold text-[var(--color-text-muted)]">
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
              className="flex items-center gap-1.5 border border-[var(--color-border-light)] bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
            >
              View Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {status === "selected" && (
            <Link
              to={`/deals?listingId=${listingId}`}
              className="flex items-center gap-1.5 bg-[var(--color-secondary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              Go to Deal
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {(bid?.submitted_at || bid?.created_at) && (
          <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
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
  const { data: bidsData, isLoading } = useGetMyBidsQuery();
  const allOffers = normalizeOffers(bidsData);

  const activeOffers = allOffers.filter((b) =>
    ["active", "selected", "backup"].includes(getOfferStatus(b)),
  );
  const pastOffers = allOffers.filter((b) =>
    ["rejected", "deleted"].includes(getOfferStatus(b)),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(rgba(212,175,55,0.45) 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 border-white/10" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 border-[var(--color-secondary)]/20" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15 px-4 py-1.5 backdrop-blur-sm">
              <Handshake className="h-3 w-3 text-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Offer Tracker
              </span>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                My Offers
              </h1>
              <div className="mt-1 h-0.5 w-16 rounded-full bg-[var(--color-secondary)]/60" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              Track every representation offer you've submitted to sellers across the
              platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "Active Offers",
                value: isLoading ? "—" : activeOffers.length,
                icon: Clock,
              },
              {
                label: "Past Offers",
                value: isLoading ? "—" : pastOffers.length,
                icon: History,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg"
              >
                <stat.icon className="h-5 w-5 text-[var(--color-secondary)]" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/50">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
              Loading your offers...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && activeOffers.length === 0 && pastOffers.length === 0 && (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-12 text-center">
          <Handshake className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="mt-3 text-sm font-bold text-[var(--color-text-muted)]">
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
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Active Offers ({activeOffers.length})
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {activeOffers.map((bid: any) => (
              <OfferCard key={String(bid?._id || bid?.id)} bid={bid} />
            ))}
          </div>
        </div>
      )}

      {/* Past Offers */}
      {!isLoading && pastOffers.length > 0 && (
        <div className="mt-6">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Past Offers ({pastOffers.length})
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {pastOffers.map((bid: any) => (
              <OfferCard key={String(bid?._id || bid?.id)} bid={bid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

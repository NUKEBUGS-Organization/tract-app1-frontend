import { Link, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Building2,
  Clock,
  DollarSign,
  FileText,
  Flame,
  Loader2,
  MapPin,
  Maximize2,
  TrendingUp,
} from "lucide-react";
import {
  useGetListingByIdQuery,
  useGetListingDocumentsQuery,
} from "../../services/listingService";

/* ─── Helpers ─────────────────────────────────────────────────────── */
function formatMoney(value: any) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getHoursLeft(listing: any): number | null {
  const deadline = listing?.deadline || listing?.kill_switch_deadline;
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60));
}

function getMarginPct(listing: any): number | null {
  const ask = Number(listing?.market_price || listing?.asking_price);
  const arv = Number(listing?.arv || listing?.estimated_arv);
  if (!ask || !arv || arv <= ask) return null;
  return Math.round(((arv - ask) / arv) * 100);
}

function getBidCount(listing: any): number {
  return (
    Number(listing?.bid_count) ||
    Number(listing?.bids_summary?.total) ||
    (Array.isArray(listing?.bids) ? listing.bids.length : 0)
  );
}

function normalizeListingData(data: any): any {
  return data?.data?.data ?? data?.data ?? data ?? null;
}

function normalizeDocuments(data: any): any[] {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.documents)) return payload.documents;
  return [];
}

function StatPill({
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
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-center">
      <Icon
        className={`h-5 w-5 ${
          highlight ? "text-[var(--color-secondary)]" : "text-white/40"
        }`}
      />
      <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
        {label}
      </p>
      <p
        className={`text-base font-black ${
          highlight ? "text-[var(--color-secondary)]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id: propertyId } = useParams<{ id: string }>();

  const {
    data: rawData,
    isLoading,
    isError,
  } = useGetListingByIdQuery(propertyId!, { skip: !propertyId });

  const { data: rawDocs } = useGetListingDocumentsQuery(propertyId!, {
    skip: !propertyId,
  });

  const listing = normalizeListingData(rawData);
  const documents = normalizeDocuments(rawDocs);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
          <p className="mt-3 text-sm font-semibold text-white/40">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-8 text-center">
          <p className="text-sm font-bold text-[var(--color-danger)]">
            Unable to load this property. It may have been removed or you may
            not have access.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
          >
            ← Back to Stream
          </Link>
        </div>
      </div>
    );
  }

  const hoursLeft = getHoursLeft(listing);
  const marginPct = getMarginPct(listing);
  const bidCount = getBidCount(listing);
  const maxBids = Number(listing?.max_bids) || 10;
  const isFull = bidCount >= maxBids;
  const isUrgent = hoursLeft !== null && hoursLeft <= 24;
  const spotsLeft = maxBids - bidCount;
  const arv = Number(listing?.arv || listing?.estimated_arv);
  const repairEst = Number(listing?.repair_estimate || listing?.estimated_repairs || 0);
  const netProfit = arv && listing?.market_price ? arv - Number(listing.market_price) - repairEst : null;
  const capRate = Number(listing?.cap_rate);
  const grossRent = Number(listing?.gross_rent || listing?.monthly_rent);

  const propertyAddress = listing?.address || "Property Details";
  const city = listing?.city || "";
  const stateCode = listing?.state_code || "";
  const zipCode = listing?.zip_code || "";

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link
          to="/properties"
          className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Stream
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {isUrgent && (
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-danger)]">
                  <Flame className="h-3 w-3" />
                  Closing Soon
                </span>
              )}
              {listing?.property_type && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/50">
                  {listing.property_type}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-3xl font-black text-white lg:text-4xl">
              {propertyAddress}
            </h1>

            {(city || stateCode) && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/45">
                <MapPin className="h-4 w-4" />
                {[city, stateCode, zipCode].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          {/* Timer */}
          {hoursLeft !== null && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 ${
                isUrgent
                  ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                  : "border-white/10 bg-white/5 text-white/50"
              }`}
            >
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Time Remaining
                </p>
                <p className="text-xl font-black">{hoursLeft}h left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Image placeholder */}
          <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] lg:h-80">
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
              🏡
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-black text-white/60 backdrop-blur">
                {[
                  listing?.beds_count && `${listing.beds_count} Beds`,
                  listing?.baths_count && `${listing.baths_count} Baths`,
                  listing?.square_footage && `${Number(listing.square_footage).toLocaleString()} sqft`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </div>

          {/* Core stats grid */}
          {(listing?.beds_count ||
            listing?.baths_count ||
            listing?.square_footage ||
            listing?.year_built) && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {listing?.beds_count > 0 && (
                <StatPill icon={Bed} label="Bedrooms" value={String(listing.beds_count)} />
              )}
              {listing?.baths_count > 0 && (
                <StatPill icon={Bath} label="Bathrooms" value={String(listing.baths_count)} />
              )}
              {listing?.square_footage && (
                <StatPill
                  icon={Maximize2}
                  label="Sqft"
                  value={Number(listing.square_footage).toLocaleString()}
                />
              )}
              {listing?.year_built && (
                <StatPill icon={Building2} label="Year Built" value={String(listing.year_built)} />
              )}
            </div>
          )}

          {/* Financial breakdown */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <h2 className="mb-5 font-serif text-xl font-black text-white">
              Financial Breakdown
            </h2>

            <div className="space-y-3">
              {[
                {
                  label: "Asking Price",
                  value: formatMoney(listing?.market_price),
                  color: "text-white",
                  highlight: false,
                },
                ...(arv
                  ? [
                      {
                        label: "Estimated ARV",
                        value: formatMoney(arv),
                        color: "text-[#6ee7b7]",
                        highlight: true,
                      },
                    ]
                  : []),
                ...(repairEst
                  ? [
                      {
                        label: "Repair Estimate",
                        value: formatMoney(repairEst),
                        color: "text-[var(--color-warning)]",
                        highlight: false,
                      },
                    ]
                  : []),
                ...(netProfit !== null
                  ? [
                      {
                        label: "Est. Net Profit",
                        value: formatMoney(netProfit),
                        color:
                          netProfit >= 0
                            ? "text-[var(--color-secondary)]"
                            : "text-[var(--color-danger)]",
                        highlight: true,
                      },
                    ]
                  : []),
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    row.highlight
                      ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
                      : "border-white/6 bg-white/[0.02]"
                  }`}
                >
                  <span className="text-[12px] font-semibold text-white/60">
                    {row.label}
                  </span>
                  <span className={`text-base font-black ${row.color}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Margin / Cap Rate / Rent row */}
            {(marginPct || capRate || grossRent) && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {marginPct && (
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
                      Margin
                    </p>
                    <p className="mt-1 text-lg font-black text-[#6ee7b7]">
                      {marginPct}%
                    </p>
                  </div>
                )}
                {capRate > 0 && (
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
                      Cap Rate
                    </p>
                    <p className="mt-1 text-lg font-black text-[var(--color-secondary)]">
                      {capRate}%
                    </p>
                  </div>
                )}
                {grossRent > 0 && (
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
                      Gross Rent
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      ${grossRent}/mo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {(listing?.description || listing?.seller_notes) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-3 font-serif text-xl font-black text-white">
                Property Overview
              </h2>
              <p className="text-sm leading-7 text-white/55">
                {listing?.description || listing?.seller_notes}
              </p>
            </div>
          )}

          {/* Property details */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 font-serif text-xl font-black text-white">
              Property Details
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Condition",
                  value: listing?.condition_report?.overall || listing?.condition,
                },
                { label: "Zoning", value: listing?.zoning },
                { label: "Lot Size", value: listing?.lot_size },
                { label: "State", value: listing?.state_code },
                { label: "ZIP Code", value: listing?.zip_code },
                { label: "Year Built", value: listing?.year_built },
                { label: "Property Type", value: listing?.property_type },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[13px] font-bold text-white capitalize">
                      {String(item.value)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right sticky column */}
        <div className="lg:sticky lg:top-[110px] lg:self-start space-y-4">
          {/* Bid CTA panel */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">
                Submit Your Bid
              </h2>
              <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>

            {/* Price */}
            <div className="mb-4 rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
                Asking Price
              </p>
              <p className="mt-1 font-serif text-3xl font-black text-[var(--color-secondary)]">
                {formatMoney(listing?.market_price)}
              </p>
            </div>

            {/* Bid cap */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Offer Cap
                </span>
                <span
                  className={`text-[11px] font-black ${
                    isFull
                      ? "text-[var(--color-danger)]"
                      : spotsLeft <= 2
                        ? "text-[var(--color-warning)]"
                        : "text-white/50"
                  }`}
                >
                  {bidCount}/{maxBids} offers submitted
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull
                      ? "bg-[var(--color-danger)]"
                      : spotsLeft <= 2
                        ? "bg-[var(--color-warning)]"
                        : "bg-[var(--color-secondary)]"
                  }`}
                  style={{ width: `${(bidCount / maxBids) * 100}%` }}
                />
              </div>
              {!isFull && (
                <p className="mt-1 text-[10px] text-white/35">
                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            {/* CTA */}
            {isFull ? (
              <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 p-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)]">
                Bid Cap Reached — No More Offers
              </div>
            ) : (
              <Link
                to={`/properties/${propertyId}/bid`}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-secondary)] py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4" />
                Submit Offer
              </Link>
            )}

            <p className="mt-3 text-center text-[10px] text-white/30">
              Submitting a bid is not a legal obligation until signed.
            </p>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                Available Documents
              </h3>
              <div className="space-y-2">
                {documents.map((doc: any, i: number) => {
                  const label =
                    doc?.document_type
                      ?.split("_")
                      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ") ||
                    doc?.name ||
                    `Document ${i + 1}`;

                  return (
                    <a
                      key={String(doc?._id || i)}
                      href={doc?.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[12px] font-semibold text-white/60 transition hover:border-[var(--color-secondary)]/30 hover:text-white"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[var(--color-secondary)]" />
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* No docs yet */}
          {documents.length === 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                Documents
              </h3>
              <p className="text-[11px] text-white/30">
                No documents uploaded by seller yet.
              </p>
            </div>
          )}

          {/* Urgency warning */}
          {isUrgent && (
            <div className="rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                <p className="text-[11px] leading-5 text-[var(--color-danger)]/80">
                  This deal closes in {hoursLeft} hours. Submit your offer now
                  to be considered.
                </p>
              </div>
            </div>
          )}

          {/* Verified highlight */}
          {listing?.status === "live" && (
            <div className="rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[var(--color-secondary)]" />
                <p className="text-[11px] font-bold text-[var(--color-secondary)]">
                  Seller-verified listing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

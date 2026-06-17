import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Flame,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Maximize2,
  TrendingUp,
} from "lucide-react";
import {
  useGetListingByIdQuery,
  useGetListingDocumentsQuery,
} from "../../services/listingService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

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

function formatPropertyType(propertyType?: string) {
  const normalized = String(propertyType || "").toLowerCase();
  const labels: Record<string, string> = {
    sfh: "Single Family Home",
    single_family: "Single Family Home",
    single_family_home: "Single Family Home",
    multi: "Multi-Family",
    multi_family: "Multi-Family",
    multifamily: "Multi-Family",
    land: "Land",
    commercial: "Commercial",
    mixeduse: "Mixed Use",
    mixed_use: "Mixed Use",
  };
  return labels[normalized] || (propertyType ? propertyType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Off-Market Property");
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

function normalizeImageUrl(rawUrl: any) {
  if (!rawUrl) return "";

  const url = String(rawUrl).trim();

  if (!url) return "";

  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  const apiOrigin = apiBaseUrl.replace(/\/api\/v1$/, "");

  if (url.startsWith("/api/listings/")) {
    return `${apiOrigin}${url.replace(
      "/api/listings/",
      "/api/v1/listings/"
    )}`;
  }

  if (url.startsWith("/api/v1/")) {
    return `${apiOrigin}${url}`;
  }

  if (url.startsWith("api/listings/")) {
    return `${apiOrigin}/${url.replace(
      "api/listings/",
      "api/v1/listings/"
    )}`;
  }

  if (url.startsWith("api/v1/")) {
    return `${apiOrigin}/${url}`;
  }

  if (url.startsWith("listings/")) {
    return `${apiBaseUrl}/${url}`;
  }
  if (url.includes("/api/listings/")) {
    return url.replace("/api/listings/", "/api/v1/listings/");
  }

  return url;
}

function getListingImages(listing: any) {
  if (!Array.isArray(listing?.picture_urls)) {
    return [];
  }

  return listing.picture_urls
    .map((item: any, index: number) => {
      const rawUrl =
        typeof item === "string"
          ? item
          : item?.url || item?.signed_url || item?.file_url || item?.src;

      const url = normalizeImageUrl(rawUrl);

      return {
        id:
          typeof item === "string"
            ? `picture-${index}`
            : item?._id || item?.id || `picture-${index}`,
        url,
        name:
          typeof item === "string"
            ? `Property Image ${index + 1}`
            : item?.file_name || item?.name || `Property Image ${index + 1}`,
      };
    })
    .filter((image: any) => Boolean(image.url))
    .filter(
      (image: any, index: number, array: any[]) =>
        array.findIndex((item) => item.url === image.url) === index
    );
}

function StatPill({
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
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-4 text-center ${isDark
        ? "border-white/8 bg-white/[0.04]"
        : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
        }`}
    >
      <Icon
        className={`h-5 w-5 ${highlight
          ? "text-[var(--color-secondary)]"
          : isDark
            ? "text-white/40"
            : "text-[var(--color-text-muted)]"
          }`}
      />
      <p
        className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
          }`}
      >
        {label}
      </p>
      <p
        className={`text-base font-black ${highlight
          ? "text-[var(--color-secondary)]"
          : isDark
            ? "text-white"
            : "text-[var(--color-primary)]"
          }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function PropertyDetailPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { id: propertyId } = useParams<{ id: string }>();

  const {
    data: rawData,
    isLoading,
    isError,
  } = useGetListingByIdQuery(propertyId!, { skip: !propertyId });

  const { data: rawDocs } = useGetListingDocumentsQuery(propertyId!, {
    skip: !propertyId,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const listing = normalizeListingData(rawData);
  const documents = normalizeDocuments(rawDocs);
  const images = getListingImages(listing);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
          <p
            className={`mt-3 text-sm font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className={`rounded-2xl border p-8 text-center ${isDark
            ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10"
            : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
            }`}
        >
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

  const city = listing?.city || "";
  const stateCode = listing?.state_code || "";


  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link
          to="/properties"
          className={`mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
            ? "text-white/40 hover:text-white"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            }`}
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
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${isDark
                    ? "border-white/10 bg-white/5 text-white/50"
                    : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                    }`}
                >
                  {formatPropertyType(listing.property_type)}
                </span>
              )}
            </div>

            <h1
              className={`mt-3 font-serif text-3xl font-black lg:text-4xl ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              {formatPropertyType(listing?.property_type)}
            </h1>

            {(listing?.address || listing?.street_address || city || stateCode) && (
              <div
                className={`mt-2 flex items-center gap-1.5 text-sm ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"
                  }`}
              >
                <MapPin className="h-4 w-4" />
                {[listing?.address || listing?.street_address || city, stateCode].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          {/* Timer */}
          {hoursLeft !== null && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 ${isUrgent
                ? isDark
                  ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                  : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                : isDark
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
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

        <div className="space-y-6">

          <div className="space-y-3">
            <div
              className={`relative h-64 overflow-hidden rounded-2xl border lg:h-80 flex items-center justify-center ${isDark
                ? "border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex]?.url}
                    alt={images[selectedImageIndex]?.name || "Property photo"}
                    className="h-full w-full object-cover transition-all duration-300"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-all backdrop-blur"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-all backdrop-blur"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <ImageIcon
                    className={`h-10 w-10 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
                      }`}
                  />
                  <span
                    className={`text-sm font-semibold ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                      }`}
                  >
                    No property photos uploaded yet
                  </span>
                </div>
              )}


              <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
                <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-black text-white/60 backdrop-blur pointer-events-auto">
                  {[
                    listing?.beds_count && `${listing.beds_count} Beds`,
                    listing?.baths_count && `${listing.baths_count} Baths`,
                    listing?.square_footage && `${Number(listing.square_footage).toLocaleString()} sqft`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>

                {images.length > 1 && (
                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-black text-white/60 backdrop-blur">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {images.map((image: any, index: number) => {
                  const isActive = index === selectedImageIndex;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${isActive
                        ? "border-[var(--color-secondary)] scale-95"
                        : isDark
                          ? "border-white/10 hover:border-white/30"
                          : "border-[var(--color-border-light)] hover:border-[var(--color-secondary)]/40"
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {(listing?.beds_count ||
            listing?.baths_count ||
            listing?.square_footage ||
            listing?.year_built) && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {listing?.beds_count > 0 && (
                  <StatPill
                    icon={Bed}
                    label="Bedrooms"
                    value={String(listing.beds_count)}
                    isDark={isDark}
                  />
                )}
                {listing?.baths_count > 0 && (
                  <StatPill
                    icon={Bath}
                    label="Bathrooms"
                    value={String(listing.baths_count)}
                    isDark={isDark}
                  />
                )}
                {listing?.square_footage && (
                  <StatPill
                    icon={Maximize2}
                    label="Sqft"
                    value={Number(listing.square_footage).toLocaleString()}
                    isDark={isDark}
                  />
                )}
                {listing?.year_built && (
                  <StatPill
                    icon={Building2}
                    label="Year Built"
                    value={String(listing.year_built)}
                    isDark={isDark}
                  />
                )}
              </div>
            )}

          <div
            className={`rounded-2xl border p-6 ${isDark
              ? "border-white/10 bg-white/[0.04] shadow-2xl"
              : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]"
              }`}
          >
            <h2
              className={`mb-5 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Financial Breakdown
            </h2>

            <div className="space-y-3">
              {[
                {
                  label: "Asking Price",
                  value: formatMoney(listing?.market_price),
                  color: isDark ? "text-white" : "text-[var(--color-primary)]",
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
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${row.highlight
                    ? isDark
                      ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
                      : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                    : isDark
                      ? "border-white/6 bg-white/[0.02]"
                      : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                    }`}
                >
                  <span
                    className={`text-[12px] font-semibold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
                      }`}
                  >
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
                  <div
                    className={`rounded-xl border p-3 text-center ${isDark
                      ? "border-white/8 bg-white/[0.03]"
                      : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                      }`}
                  >
                    <p
                      className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      Margin
                    </p>
                    <p className="mt-1 text-lg font-black text-[#6ee7b7]">
                      {marginPct}%
                    </p>
                  </div>
                )}
                {capRate > 0 && (
                  <div
                    className={`rounded-xl border p-3 text-center ${isDark
                      ? "border-white/8 bg-white/[0.03]"
                      : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                      }`}
                  >
                    <p
                      className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      Cap Rate
                    </p>
                    <p className="mt-1 text-lg font-black text-[var(--color-secondary)]">
                      {capRate}%
                    </p>
                  </div>
                )}
                {grossRent > 0 && (
                  <div
                    className={`rounded-xl border p-3 text-center ${isDark
                      ? "border-white/8 bg-white/[0.03]"
                      : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                      }`}
                  >
                    <p
                      className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      Gross Rent
                    </p>
                    <p
                      className={`mt-1 text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                        }`}
                    >
                      ${grossRent}/mo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {(listing?.description || listing?.seller_notes) && (
            <div
              className={`rounded-2xl border p-6 ${isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-white"
                }`}
            >
              <h2
                className={`mb-3 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
              >
                Property Overview
              </h2>
              <p
                className={`text-sm leading-7 ${isDark ? "text-white/55" : "text-[var(--color-text-muted)]"
                  }`}
              >
                {listing?.description || listing?.seller_notes}
              </p>
            </div>
          )}

          {/* Property details */}
          <div
            className={`rounded-2xl border p-6 ${isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
              }`}
          >
            <h2
              className={`mb-4 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
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
                { label: "Year Built", value: listing?.year_built },
                { label: "Property Type", value: formatPropertyType(listing?.property_type) },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <p
                      className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 text-[13px] font-bold capitalize ${isDark ? "text-white" : "text-[var(--color-primary)]"
                        }`}
                    >
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
          <div
            className={`rounded-2xl border p-6 ${isDark
              ? "border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur"
              : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]"
              }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
              >
                Submit Your Bid
              </h2>
              <TrendingUp className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>

            {/* Price */}
            <div
              className={`mb-4 rounded-xl border p-4 ${isDark
                ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8"
                : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                }`}
            >
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
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  Offer Cap
                </span>
                <span
                  className={`text-[11px] font-black ${isFull
                    ? "text-[var(--color-danger)]"
                    : spotsLeft <= 2
                      ? "text-[var(--color-warning)]"
                      : isDark
                        ? "text-white/50"
                        : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {bidCount}/{maxBids} offers submitted
                </span>
              </div>
              <div
                className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/8" : "bg-[var(--color-border-light)]"
                  }`}
              >
                <div
                  className={`h-full rounded-full transition-all ${isFull
                    ? "bg-[var(--color-danger)]"
                    : spotsLeft <= 2
                      ? "bg-[var(--color-warning)]"
                      : "bg-[var(--color-secondary)]"
                    }`}
                  style={{ width: `${(bidCount / maxBids) * 100}%` }}
                />
              </div>
              {!isFull && (
                <p
                  className={`mt-1 text-[10px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            {/* CTA */}
            {isFull ? (
              <div
                className={`rounded-xl border p-4 text-center text-[11px] font-black uppercase tracking-[0.2em] ${isDark
                  ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 text-[var(--color-danger)]"
                  : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                  }`}
              >
                Bid Cap Reached — No More Offers
              </div>
            ) : (
              <Link
                to={`/properties/${propertyId}/bid`}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-secondary)] py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] rounded-xl"
              >
                <DollarSign className="h-4 w-4" />
                Submit Offer
              </Link>
            )}

            <p
              className={`mt-3 text-center text-[10px] ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                }`}
            >
              Submitting a bid is not a legal obligation until signed.
            </p>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div
              className={`rounded-2xl border p-5 ${isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-white"
                }`}
            >
              <h3
                className={`mb-3 text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                  }`}
              >
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
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-[12px] font-semibold transition ${isDark
                        ? "border-white/8 bg-white/[0.03] text-white/60 hover:border-[var(--color-secondary)]/30 hover:text-white"
                        : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:border-[var(--color-secondary)]/30 hover:text-[var(--color-primary)]"
                        }`}
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
            <div
              className={`rounded-2xl border p-5 ${isDark
                ? "border-white/8 bg-white/[0.03]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
            >
              <h3
                className={`mb-2 text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                  }`}
              >
                Documents
              </h3>
              <p
                className={`text-[11px] ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                  }`}
              >
                No documents uploaded by seller yet.
              </p>
            </div>
          )}

          {/* Urgency warning */}
          {isUrgent && (
            <div
              className={`rounded-xl border px-4 py-3 ${isDark
                ? "border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5"
                : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10"
                }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                <p
                  className={`text-[11px] leading-5 ${isDark
                    ? "text-[var(--color-danger)]/80"
                    : "text-[var(--color-danger)]"
                    }`}
                >
                  This deal closes in {hoursLeft} hours. Submit your offer now
                  to be considered.
                </p>
              </div>
            </div>
          )}

          {/* Verified highlight */}
          {listing?.status === "live" && (
            <div
              className={`rounded-xl border px-4 py-3 ${isDark
                ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
                : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                }`}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[var(--color-secondary)]" />
                <p
                  className={`text-[11px] font-bold ${isDark
                    ? "text-[var(--color-secondary)]"
                    : "text-[var(--color-primary)]"
                    }`}
                >
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
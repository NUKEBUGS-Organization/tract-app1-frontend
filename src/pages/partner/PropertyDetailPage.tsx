import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Building2,
  Camera,
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
  X,
} from "lucide-react";
import {
  useGetListingByIdQuery,
  useGetListingDocumentsQuery,
} from "../../services/listingService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";
import { useAuthContext } from "../../contexts/AuthContext";
import { isAllowedRole, normalizeRole, REALTOR_ROLES } from "../../constants/roles";

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

function isPlaceholderValue(value: any) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["", "string", "n/a", "null", "undefined"].includes(normalized);
  }
  return false;
}

function displayValue(value: any) {
  return isPlaceholderValue(value) ? "-" : value;
}

function formatCondition(value?: string) {
  if (isPlaceholderValue(value)) return "-";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function Detail({ label, value, isDark }: { label: string; value: any; isDark: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
        {label}
      </p>
      <p className={`mt-1 text-[13px] font-bold capitalize ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
        {displayValue(value)}
      </p>
    </div>
  );
}

function NotesBox({ label, value, isDark }: { label: string; value: any; isDark: boolean }) {
  if (isPlaceholderValue(value)) return null;
  return (
    <div className={`mt-5 rounded-xl p-4 ${isDark ? "bg-white/[0.03] border border-white/5" : "bg-[var(--color-bg-soft)]"}`}>
      <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
        {label}
      </p>
      <p className={`mt-2 text-[13px] leading-6 ${isDark ? "text-white/70" : "text-[var(--color-text-main)]"}`}>
        {value}
      </p>
    </div>
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

function PropertyImageGallery({ listing, isDark }: { listing: any; isDark: boolean }) {
  const images = getListingImages(listing);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!previewOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [previewOpen]);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex]?.url : null;

  function goPrevious() {
    if (!hasImages) return;
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function goNext() {
    if (!hasImages) return;
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <>
      <section className={`overflow-hidden rounded-3xl border shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
        <div className={`flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              Media Gallery
            </p>
            <h2 className={`mt-1 flex items-center gap-2 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
              <Camera className="h-5 w-5 text-[var(--color-secondary)]" />
              Property Photos
            </h2>
          </div>
          <div className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${isDark ? "bg-white/10 text-white" : "bg-[var(--color-primary)] text-white"}`}>
            {images.length} {images.length === 1 ? "Photo" : "Photos"}
          </div>
        </div>

        {!hasImages ? (
          <div className={`flex min-h-[320px] flex-col items-center justify-center bg-gradient-to-br px-6 py-12 text-center ${isDark ? "from-white/5 to-transparent" : "from-[var(--color-bg-soft)] to-white"}`}>
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? "bg-white/5" : "bg-[var(--color-primary)]/10"}`}>
              <ImageIcon className={`h-8 w-8 ${isDark ? "text-white/40" : "text-[var(--color-primary)]"}`} />
            </div>
            <h3 className={`mt-4 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
              No property photos uploaded yet
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_280px]">
            <div className="relative bg-black">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group block h-[420px] w-full overflow-hidden"
              >
                <img
                  src={activeImage}
                  alt="Selected property view"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                      Featured View
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-black text-white">
                      Photo {activeIndex + 1} of {images.length}
                    </h3>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md sm:flex">
                    <Maximize2 className="h-4 w-4" />
                    View Large
                  </div>
                </div>
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-lg transition hover:scale-105 hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-lg transition hover:scale-105 hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className={`border-t p-4 lg:border-l lg:border-t-0 ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-white"}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                  Gallery
                </p>
                <p className={`text-[10px] font-bold ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
                  Click to preview
                </p>
              </div>

              <div className="grid max-h-[370px] grid-cols-3 gap-3 overflow-y-auto pr-1 lg:grid-cols-2">
                {images.map((image: any, index: number) => {
                  const active = index === activeIndex;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border transition ${active
                        ? "border-[var(--color-secondary)] ring-2 ring-[var(--color-secondary)]/40"
                        : isDark
                          ? "border-white/10 hover:border-[var(--color-secondary)]"
                          : "border-[var(--color-border-light)] hover:border-[var(--color-primary)]"
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={`Property thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                            Selected
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {previewOpen &&
        activeImage &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black/80 p-6 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <div className="relative flex max-h-[88vh] max-w-[88vw] items-center justify-center rounded-3xl bg-white p-3 shadow-2xl">
              <img
                src={activeImage}
                alt="Large property preview"
                className="max-h-[82vh] max-w-[84vw] rounded-2xl object-contain"
              />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-sm font-bold text-white shadow-lg">
                {activeIndex + 1} / {images.length}
              </div>
            </div>
            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-xl transition hover:scale-105"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default function PropertyDetailPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";
  const { role } = useAuthContext();
  const isRealtor = isAllowedRole(normalizeRole(role), REALTOR_ROLES);

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

          <div className="mb-6">
            <PropertyImageGallery listing={listing} isDark={isDark} />
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
            {(!!marginPct || capRate > 0 || grossRent > 0) && (
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


          <div
            className={`rounded-2xl border p-6 ${isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
              }`}
          >
            <h2
              className={`mb-4 text-sm font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Legal Disclosures
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Active Liens or Mortgages" value={listing?.has_liens ? "Yes" : "No"} isDark={isDark} />
              <Detail label="Pre-Foreclosure" value={listing?.is_preforeclosure ? "Yes" : "No"} isDark={isDark} />
              <Detail label="Mortgage Amount" value={formatMoney(listing?.mortgage_amount)} isDark={isDark} />
              <Detail label="Vacant" value={listing?.is_vacant ? "Yes" : "No"} isDark={isDark} />
              <Detail label="Off Market" value={listing?.is_off_market ? "Yes" : "No"} isDark={isDark} />
              <Detail label="Proof of Funds Required" value={listing?.proof_of_funds_required ? "Yes" : "No"} isDark={isDark} />
            </div>
            <NotesBox label="Lien Disclosure" value={listing?.lien_disclosure} isDark={isDark} />
          </div>


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
              Condition Report
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Roof" value={formatCondition(listing?.condition_report?.roof)} isDark={isDark} />
              <Detail label="HVAC" value={formatCondition(listing?.condition_report?.hvac)} isDark={isDark} />
              <Detail label="Wetlands" value={listing?.condition_report?.wetlands ? "Yes" : "No"} isDark={isDark} />
              <Detail label="Overall" value={formatCondition(listing?.condition_report?.overall)} isDark={isDark} />
            </div>
            <NotesBox label="Notes" value={listing?.condition_report?.notes} isDark={isDark} />
          </div>


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
              Motivation
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Motivation" value={listing?.motivation} isDark={isDark} />
              <Detail label="Sell Timeline" value={listing?.sell_timeline} isDark={isDark} />
              <Detail label="Realtor Commission" value={listing?.realtor_commission} isDark={isDark} />
              {/* <Detail label="Suggested Price" value={formatMoney(listing?.suggested_price)} isDark={isDark} /> */}
            </div>
          </div>
        </div>


        <div className="lg:sticky lg:top-[110px] lg:self-start space-y-4">

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
            ) : isRealtor ? (
              <Link
                to={`/properties/${propertyId}/offer`}
                className="flex w-full items-center justify-center gap-2 bg-[var(--color-danger)] py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[var(--shadow-premium)] transition hover:scale-[1.02] rounded-xl"
              >
                <DollarSign className="h-4 w-4" />
                Submit Representation Offer
              </Link>
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
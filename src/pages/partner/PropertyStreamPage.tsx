import { useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  CircleAlert,
  Clock,
  Flame,
  MapPin,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useGetListingsQuery } from "../../services/listingService";
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


function getBidCount(listing: any): number {
  return (
    Number(listing?.bid_count) ||
    Number(listing?.bids_summary?.total) ||
    (Array.isArray(listing?.bids) ? listing.bids.length : 0)
  );
}

function normalizeListings(data: any): any[] {
  const payload = data?.data?.data ?? data?.data ?? data;
  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getFirstImageUrl(listing: any): string | null {
  const urls =
    listing?.picture_urls ||
    listing?.property_picture_urls ||
    listing?.images ||
    [];

  if (!Array.isArray(urls) || urls.length === 0) return null;

  const item = urls.find(Boolean);
  if (!item) return null;
  if (typeof item === "string") return item;
  return item?.url || item?.signed_url || item?.file_url || item?.src || null;
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
  return (
    labels[normalized] ||
    (propertyType
      ? propertyType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Off-Market Property")
  );
}

function getStatusConfig(listing: any, isUrgent: boolean) {
  const status = String(listing?.status || "").toLowerCase();
  if (status === "live" && isUrgent) {
    return {
      label: "Hot",
      icon: Flame,
      className:
        "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border border-[var(--color-danger)]/30",
    };
  }
  if (status === "live") {
    return {
      label: "Live",
      icon: Sparkles,
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
    };
  }
  if (status === "under_contract") {
    return {
      label: "Under Contract",
      icon: Clock,
      className:
        "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30",
    };
  }
  return {
    label: listing?.status || "Available",
    icon: Building2,
    className: "bg-white/10 text-white/50 border border-white/10",
  };
}


function BidCapBar({
  bidCount,
  maxBids = 10,
  isDark,
}: {
  bidCount: number;
  maxBids?: number;
  isDark: boolean;
}) {
  const pct = Math.min(100, (bidCount / maxBids) * 100);
  const isFull = bidCount >= maxBids;
  const isNearFull = pct >= 70;

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`text-[10px] font-semibold ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"}`}
        >
          Bid Cap
        </span>
        <span
          className={`text-[10px] font-black ${isFull
            ? "text-[var(--color-danger)]"
            : isNearFull
              ? "text-[var(--color-warning)]"
              : isDark
                ? "text-white/50"
                : "text-[var(--color-text-muted)]"
            }`}
        >
          {bidCount}/{maxBids} offers
        </span>
      </div>
      <div
        className={`h-1 w-full overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"
          }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${isFull
            ? "bg-[var(--color-danger)]"
            : isNearFull
              ? "bg-[var(--color-warning)]"
              : "bg-[var(--color-secondary)]"
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


function PropertyImage({ listing, isDark }: { listing: any; isDark: boolean }) {
  const [errored, setErrored] = useState(false);
  const url = getFirstImageUrl(listing);

  if (!url || errored) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${isDark
          ? "bg-gradient-to-br from-white/5 to-white/[0.02]"
          : "bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5"
          }`}
      >
        <Building2
          className={`h-9 w-9 ${isDark ? "text-white/15" : "text-[var(--color-primary)]/15"}`}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={formatPropertyType(listing?.property_type)}
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}


function PropertyCard({
  listing,
  isDark,
  delay = 0,
  isRealtor = false,
}: {
  listing: any;
  isDark: boolean;
  delay?: number;
  isRealtor?: boolean;
}) {
  const id = String(listing?._id || listing?.id || "");
  const bidCount = getBidCount(listing);
  const maxBids = Number(listing?.max_bids) || 10;
  const isFull = bidCount >= maxBids;
  const isUrgent = bidCount / maxBids >= 0.7 && !isFull;
  const statusConfig = getStatusConfig(listing, isUrgent);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`group relative flex animate-[cardIn_0.45s_ease-out_backwards] flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${isDark
        ? "border-white/10 bg-white/[0.05] hover:border-[var(--color-secondary)]/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.15),0_20px_60px_rgba(0,0,0,0.25)]"
        : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-secondary)]/40"
        }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Bottom accent bar – light mode only */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${isDark
          ? "bg-transparent"
          : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
          }`}
      />

      <div className="relative h-40 overflow-hidden">
        <PropertyImage listing={listing} isDark={isDark} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none" />

        <div
          className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur ${statusConfig.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p
            className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {formatPropertyType(listing?.property_type)}
          </p>
          <div
            className={`mt-1 flex items-center gap-1 text-[11px] ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"
              }`}
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[
                listing?.address || listing?.street_address || listing?.city,
                listing?.state_code,
              ]
                .filter(Boolean)
                .join(", ") || "Location Hidden"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Price",
              value: formatMoney(listing?.market_price),
              highlight: false,
            },
            {
              label: "Year Built",
              value: listing?.year_built || "—",
              highlight: false,
            },
            {
              label: "Condition",
              value: listing?.condition_report?.overall
                ? String(listing.condition_report.overall).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                : "—",
              highlight: true,
              title: "Reported Property Condition",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              title={stat.title}
              className={`rounded-xl border p-2 text-center ${isDark
                ? "border-white/8 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
            >
              <p
                className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                  }`}
              >
                {stat.label}
              </p>
              <p
                className={`mt-0.5 text-[12px] font-black ${stat.highlight
                  ? "text-[#16a34a]"
                  : isDark
                    ? "text-white"
                    : "text-[var(--color-primary)]"
                  }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
        >
          {listing?.unit_count > 1 && <span>{listing.unit_count} Units</span>}
          {listing?.zoning && <span>{listing.zoning}</span>}
          {listing?.is_vacant ? <span>Vacant</span> : <span>Occupied</span>}
          {listing?.has_liens ? <span className="text-[var(--color-danger)]">Liens</span> : <span>Clear Title</span>}
          {listing?.is_preforeclosure && <span className="text-[var(--color-danger)]">Preforeclosure</span>}
        </div>


        <BidCapBar bidCount={bidCount} maxBids={maxBids} isDark={isDark} />


        <div className="mt-auto flex gap-2 pt-2">
          <Link
            to={`/properties/${id}`}
            className={`flex-1 rounded-xl border py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] transition ${isDark
              ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}
          >
            View Details
          </Link>

          {isFull ? (
            <div
              title="This property has reached its bid cap"
              className="flex-1 cursor-not-allowed rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)]/60"
            >
              Cap Reached
            </div>
          ) : isRealtor ? (
            <Link
              to={`/properties/${id}/offer`}
              className="flex-1 rounded-xl bg-[var(--color-secondary)] py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:bg-[var(--color-secondary)] hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              Submit Offer
            </Link>
          ) : (

            <Link
              to={`/properties/${id}/bid`}
              className="flex-1 rounded-xl bg-[var(--color-secondary)] py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:bg-[var(--color-secondary)] hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              Submit Bid
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyCardSkeleton({ isDark }: { isDark: boolean }) {
  const shimmer = isDark ? "bg-white/[0.06]" : "bg-[var(--color-border-light)]";
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-white"
        }`}
    >
      <div className={`h-40 animate-pulse ${shimmer}`} />
      <div className="flex flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className={`h-3.5 w-2/3 animate-pulse rounded ${shimmer}`} />
          <div className={`h-3 w-1/2 animate-pulse rounded ${shimmer}`} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-12 animate-pulse rounded-xl ${shimmer}`} />
          ))}
        </div>
        <div className={`h-1.5 w-full animate-pulse rounded-full ${shimmer}`} />
        <div className="flex gap-2 pt-2">
          <div className={`h-9 flex-1 animate-pulse rounded-xl ${shimmer}`} />
          <div className={`h-9 flex-1 animate-pulse rounded-xl ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}


const PROPERTY_TYPES = ["All Types", "sfh", "multi_family", "land"];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  "All Types": "All Types",
  sfh: "Single Family Home",
  multi_family: "Multi-Family",
  land: "Land",
};
const STATES = ["All States", "NY", "NJ"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];


export default function PropertyStreamPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";
  const { role } = useAuthContext();
  const isRealtor = isAllowedRole(normalizeRole(role), REALTOR_ROLES);

  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedState, setSelectedState] = useState("All States");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useGetListingsQuery(
    { status: "live" },
    { refetchOnMountOrArgChange: true },
  );

  const allListings = normalizeListings(data);

  const filtered = allListings
    .filter((l) => {
      const matchType =
        selectedType === "All Types" || l?.property_type === selectedType;
      const matchState =
        selectedState === "All States" || l?.state_code === selectedState;
      return matchType && matchState;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = new Date(
          a?.createdAt || a?.submitted_at || a?.created_at || 0,
        ).getTime();
        const dateB = new Date(
          b?.createdAt || b?.submitted_at || b?.created_at || 0,
        ).getTime();
        return dateB - dateA;
      }
      if (sortBy === "price_asc")
        return Number(a.market_price) - Number(b.market_price);
      if (sortBy === "price_desc")
        return Number(b.market_price) - Number(a.market_price);
      return 0;
    });

  const hotDeals = allListings.filter((l) => {
    const bids = getBidCount(l);
    const max = Number(l?.max_bids) || 10;
    return bids / max >= 0.7 && bids < max;
  }).length;


  const hasActiveFilters =
    selectedType !== "All Types" || selectedState !== "All States";

  const clearFilters = () => {
    setSelectedType("All Types");
    setSelectedState("All States");
  };

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .group { animation: none !important; }
        }
      `}</style>

      {/* ─── HEADER ─── */}
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

        {/* Golden Rings */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${isDark
            ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
            : "border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            }`}
        />
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${isDark
            ? "border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
            : "border-[var(--color-secondary)]/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            }`}
        />
        {isDark && (
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full border border-[#d4af37]/10 shadow-[0_0_80px_rgba(212,175,55,0.05)]" />
        )}

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${isDark
                ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"
                }`}
            >
              <div
                className={`h-2 w-2 animate-pulse rounded-full ${isDark ? "bg-[#d4af37]" : "bg-[var(--color-secondary)]"
                  }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                  }`}
              >
                Live Deal Stream
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                Property Stream
              </h1>
              <div
                className={`mt-1 h-0.5 w-16 rounded-full ${isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"
                  }`}
              />
            </div>

            <p
              className={`max-w-xl text-sm leading-relaxed ${isDark ? "text-white/60" : "text-white/70"
                }`}
            >
              Browse off‑market opportunities. Each property is capped at 10
              offers —{" "}
              <span
                className={`font-bold ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                  }`}
              >
                act fast
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${isDark
                ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30"
                : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
            >
              <Building2
                className={`h-5 w-5 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                  }`}
              />
              <div>
                <p
                  className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"
                    }`}
                >
                  Available
                </p>
                <p className="text-xl font-black text-white tabular-nums">
                  {isLoading ? "—" : allListings.length}
                </p>
              </div>
            </div>

            <div
              className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${isDark
                ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30"
                : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
            >
              <Flame
                className={`h-5 w-5 ${isDark ? "text-[#d4af37]" : "text-[var(--color-danger)]"
                  }`}
              />
              <div>
                <p
                  className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"
                    }`}
                >
                  Hot Deals
                </p>
                <p className="text-xl font-black text-white tabular-nums">
                  {isLoading ? "—" : hotDeals}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Filters + Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${showFilters
              ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
              : isDark
                ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
                : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[9px] text-[var(--color-primary-dark)]">
                {(selectedType !== "All Types" ? 1 : 0) +
                  (selectedState !== "All States" ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] transition ${isDark ? "text-white/40 hover:text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                }`}
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort properties"
          className={`rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] outline-none focus:border-[var(--color-secondary)]/50 ${isDark
            ? "border-white/10 bg-[#1a1e24] text-white"
            : "border-[var(--color-border-light)] bg-white text-[var(--color-text-main)]"
            }`}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showFilters && (
        <div
          className={`flex flex-wrap gap-6 rounded-2xl border p-4 ${isDark
            ? "border-white/8 bg-white/[0.03]"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            }`}
        >
          <div>
            <p
              className={`mb-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
            >
              Property Type
            </p>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  aria-pressed={selectedType === type}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${selectedType === type
                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                    : isDark
                      ? "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                      : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                    }`}
                >
                  {PROPERTY_TYPE_LABELS[type] || type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              className={`mb-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
            >
              State
            </p>
            <div className="flex flex-wrap gap-2">
              {STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setSelectedState(state)}
                  aria-pressed={selectedState === state}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${selectedState === state
                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                    : isDark
                      ? "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                      : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                    }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          {isLoading
            ? "Loading..."
            : `${filtered.length} deal${filtered.length === 1 ? "" : "s"} available`}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh Stream
        </button>
      </div>


      {isError && !isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-5">
          <CircleAlert className="h-5 w-5 shrink-0 text-[var(--color-danger)]" />
          <div className="flex-1">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-text-main)]"}`}>
              Couldn't load the property stream
            </p>
            <p className={`text-[12px] ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
              Check your connection and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-[var(--color-danger)]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
          >
            Retry
          </button>
        </div>
      )}


      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} isDark={isDark} />
          ))}
        </div>
      )}


      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center ${isDark
            ? "border-white/8 bg-white/[0.03]"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            }`}
        >
          <Building2
            className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
              }`}
          />
          <p
            className={`mt-3 text-sm font-bold ${isDark ? "text-white/70" : "text-[var(--color-text-main)]"
              }`}
          >
            {allListings.length === 0
              ? "No live listings right now"
              : "Nothing matches your filters"}
          </p>
          <p
            className={`mx-auto mt-1 max-w-sm text-[12px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
          >
            {allListings.length === 0
              ? "New deals are added throughout the day — check back soon or refresh the stream."
              : "Try a different property type or state, or clear your filters to see everything."}
          </p>
          {allListings.length > 0 && hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing: any, i: number) => (
            <PropertyCard
              key={String(listing?._id || listing?.id)}
              listing={listing}
              isDark={isDark}
              delay={Math.min(i, 8) * 40}
              isRealtor={isRealtor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
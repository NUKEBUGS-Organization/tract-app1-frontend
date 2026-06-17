import { useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  Clock,
  Flame,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { useGetListingsQuery } from "../../services/listingService";
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

// function getListingLabel(listing: any) {
//   // Show only city + state to hide the exact address from wholesalers
//   const city = listing?.city || "";
//   const state = listing?.state_code || "";
//   if (city && state) return `${city}, ${state}`;
//   if (city) return city;
//   if (state) return state;
//   return "Off-Market Property";
// }

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
  return labels[normalized] || (propertyType ? propertyType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Off-Market Property");
}

function getStatusConfig(listing: any, hoursLeft: number | null) {
  const status = String(listing?.status || "").toLowerCase();
  if (status === "live" && hoursLeft !== null && hoursLeft <= 24) {
    return {
      label: "🔥 Hot",
      className:
        "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border border-[var(--color-danger)]/30",
    };
  }
  if (status === "live") {
    return {
      label: "✨ Live",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
    };
  }
  if (status === "under_contract") {
    return {
      label: "⏳ Under Contract",
      className:
        "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30",
    };
  }
  return {
    label: "📋 " + (listing?.status || "Available"),
    className: "bg-white/10 text-white/50 border border-white/10",
  };
}

/* ─── Enhanced BidCapBar ──────────────────────────────────────────── */
function BidCapBar({ bidCount, maxBids = 10, isDark }: { bidCount: number; maxBids?: number; isDark: boolean }) {
  const pct = Math.min(100, (bidCount / maxBids) * 100);
  const isFull = bidCount >= maxBids;
  const isNearFull = pct >= 70;

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-[10px] font-semibold ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"}`}>
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
          className={`h-full rounded-full transition-all ${isFull
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

/* ─── Enhanced PropertyCard ──────────────────────────────────────── */
function PropertyCard({ listing, isDark }: { listing: any; isDark: boolean }) {
  const id = String(listing?._id || listing?.id || "");
  const hoursLeft = getHoursLeft(listing);
  const marginPct = getMarginPct(listing);
  const bidCount = getBidCount(listing);
  const maxBids = Number(listing?.max_bids) || 10;
  const isFull = bidCount >= maxBids;
  const isUrgent = hoursLeft !== null && hoursLeft <= 24;
  const statusConfig = getStatusConfig(listing, hoursLeft);
  const arv = Number(listing?.arv || listing?.estimated_arv);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${isDark
        ? "border-white/10 bg-white/[0.05] hover:border-[var(--color-secondary)]/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.15),0_20px_60px_rgba(0,0,0,0.25)]"
        : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-secondary)]/40"
        }`}
    >
      {/* Bottom accent bar – light mode only */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${isDark
          ? "bg-transparent"
          : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
          }`}
      />

      {/* Image / Placeholder */}
      <div
        className={`relative h-40 overflow-hidden ${isDark
          ? "bg-gradient-to-br from-white/5 to-white/[0.02]"
          : "bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5"
          }`}
      >
        {getFirstImageUrl(listing) ? (
          <img
            src={getFirstImageUrl(listing)!}
            alt="Property preview"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
            🏡
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none" />

        <div
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur ${statusConfig.className}`}
        >
          {statusConfig.label}
        </div>

        {hoursLeft !== null && (
          <div
            className={`absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black backdrop-blur ${isUrgent
              ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              : "border-white/10 bg-black/40 text-white"
              }`}
          >
            <Clock className="h-3 w-3" />
            {hoursLeft}h left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
            {formatPropertyType(listing?.property_type)}
          </p>
          <div className={`mt-1 flex items-center gap-1 text-[11px] ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"}`}>
            <MapPin className="h-3 w-3" />
            {[listing?.address || listing?.street_address || listing?.city, listing?.state_code].filter(Boolean).join(", ") || "Location Hidden"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Price", value: formatMoney(listing?.market_price), highlight: false },
            { label: "ARV", value: arv ? formatMoney(arv) : "—", highlight: false },
            { label: "Margin", value: marginPct ? `${marginPct}%` : "—", highlight: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border p-2 text-center ${isDark
                ? "border-white/8 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
            >
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"}`}>
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

        {/* Property details */}
        <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
          {listing?.beds_count > 0 && <span>{listing.beds_count} beds</span>}
          {listing?.baths_count > 0 && <span>{listing.baths_count} baths</span>}
          {listing?.square_footage && (
            <span>{Number(listing.square_footage).toLocaleString()} sqft</span>
          )}
          {listing?.property_type && <span>{listing.property_type}</span>}
        </div>

        {/* Bid cap */}
        <BidCapBar bidCount={bidCount} maxBids={maxBids} isDark={isDark} />

        {/* Actions */}
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
            <div className="flex-1 cursor-not-allowed rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)]/60">
              Cap Reached
            </div>
          ) : (
            <Link
              to={`/properties/${id}/bid`}
              className="flex-1 rounded-xl bg-[var(--color-secondary)] py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              Submit Bid
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page constants ─────────────────────────────────────────────── */
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
  { value: "margin_desc", label: "Best Margin" },
];

/* ─── Page Component ─────────────────────────────────────────────── */
export default function PropertyStreamPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedState, setSelectedState] = useState("All States");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetListingsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const allListings = normalizeListings(data);

  const filtered = allListings
    .filter((l) => {
      const matchSearch =
        !search ||
        String(l?.state_code || "").toLowerCase().includes(search.toLowerCase()) ||
        String(l?.city || "").toLowerCase().includes(search.toLowerCase()) ||
        String(l?.property_type || "").toLowerCase().includes(search.toLowerCase());
      const matchType =
        selectedType === "All Types" || l?.property_type === selectedType;
      const matchState =
        selectedState === "All States" || l?.state_code === selectedState;
      return matchSearch && matchType && matchState;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = new Date(a?.createdAt || a?.submitted_at || a?.created_at || 0).getTime();
        const dateB = new Date(b?.createdAt || b?.submitted_at || b?.created_at || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "price_asc")
        return Number(a.market_price) - Number(b.market_price);
      if (sortBy === "price_desc")
        return Number(b.market_price) - Number(a.market_price);
      if (sortBy === "margin_desc") {
        const ma = getMarginPct(a) ?? 0;
        const mb = getMarginPct(b) ?? 0;
        return mb - ma;
      }
      return 0;
    });

  const hotDeals = allListings.filter((l) => {
    const h = getHoursLeft(l);
    return h !== null && h <= 24;
  }).length;

  const avgMargin =
    allListings.length > 0
      ? Math.round(
        allListings.reduce((s, l) => s + (getMarginPct(l) ?? 0), 0) /
        allListings.length
      )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-card)] ${isDark
          ? "border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
          : "bg-[var(--color-primary)]"
          }`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Live Deal Stream
              </span>
            </div>

            <h1 className={`font-serif text-3xl font-black lg:text-4xl ${isDark ? "text-white" : "text-white"}`}>
              Property Stream
            </h1>
            <p className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-white/50" : "text-white/60"}`}>
              Browse off-market opportunities. Each property is capped at 10
              offers — act fast.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${isDark
              ? "border-white/10 bg-white/5"
              : "border-white/20 bg-white/10"
              }`}>
              <Building2 className={`h-4 w-4 ${isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-secondary)]"}`} />
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"}`}>
                  Available
                </p>
                <p className={`text-xl font-black ${isDark ? "text-white" : "text-white"}`}>
                  {isLoading ? "—" : allListings.length}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${isDark
              ? "border-white/10 bg-white/5"
              : "border-white/20 bg-white/10"
              }`}>
              <Flame className="h-4 w-4 text-[var(--color-danger)]" />
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"}`}>
                  Hot Deals
                </p>
                <p className={`text-xl font-black ${isDark ? "text-white" : "text-white"}`}>
                  {isLoading ? "—" : hotDeals}
                </p>
              </div>
            </div>

            {avgMargin > 0 && (
              <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${isDark
                ? "border-white/10 bg-white/5"
                : "border-white/20 bg-white/10"
                }`}>
                <TrendingUp className="h-4 w-4 text-[#6ee7b7]" />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"}`}>
                    Avg Margin
                  </p>
                  <p className="text-xl font-black text-[#16a34a]">{avgMargin}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-[var(--color-secondary)]/50 ${isDark ? "border-white/10 bg-white/5" : "border-[var(--color-border-light)] bg-[var(--color-bg-card)]"}`}>
          <Search className={`h-4 w-4 shrink-0 ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, state, type..."
            className={`w-full bg-transparent text-sm outline-none ${isDark ? "text-white placeholder-white/25" : "text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]"}`}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${showFilters
            ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
            : isDark
              ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
            }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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
        <div className={`flex flex-wrap gap-6 rounded-2xl border p-4 ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}>
          <div>
            <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              Property Type
            </p>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
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
            <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              State
            </p>
            <div className="flex flex-wrap gap-2">
              {STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setSelectedState(state)}
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

      {/* Results count + refresh */}
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
          {isLoading ? "Loading..." : `${filtered.length} propert${filtered.length === 1 ? "y" : "ies"} found`}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
            <p className={`mt-3 text-sm font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              Loading property stream...
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}>
          <Building2 className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"}`} />
          <p className={`mt-3 text-sm font-bold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
            {allListings.length === 0
              ? "No live listings available right now. Check back soon."
              : "No properties match your filters."}
          </p>
          {allListings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedType("All Types");
                setSelectedState("All States");
              }}
              className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing: any) => (
              <PropertyCard
                key={String(listing?._id || listing?.id)}
                listing={listing}
                isDark={isDark}
              />
            ))}
          </div>

          {/* <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
            >
              Refresh for Latest Deals
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div> */}
        </>
      )}
    </div>
  );
}
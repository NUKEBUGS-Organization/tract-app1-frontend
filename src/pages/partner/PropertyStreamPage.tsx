import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
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

function getListingLabel(listing: any) {
  return listing?.address || "Untitled Property";
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

function normalizeListings(data: any): any[] {
  const payload = data?.data?.data ?? data?.data ?? data;
  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload)) return payload;
  return [];
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

function BidCapBar({ bidCount, maxBids = 10 }: { bidCount: number; maxBids?: number }) {
  const pct = Math.min(100, (bidCount / maxBids) * 100);
  const isFull = bidCount >= maxBids;
  const isNearFull = pct >= 70;

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/35">Bid Cap</span>
        <span
          className={`text-[10px] font-black ${
            isFull
              ? "text-[var(--color-danger)]"
              : isNearFull
                ? "text-[var(--color-warning)]"
                : "text-white/50"
          }`}
        >
          {bidCount}/{maxBids} offers
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${
            isFull
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

function PropertyCard({ listing }: { listing: any }) {
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur transition-all duration-300 hover:border-[var(--color-secondary)]/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.15),0_20px_60px_rgba(0,0,0,0.4)]">
      {/* Image placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-white/5 to-white/[0.02]">
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
          🏡
        </div>

        {/* Status */}
        <div
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusConfig.className}`}
        >
          {statusConfig.label}
        </div>

        {/* Timer */}
        {hoursLeft !== null && (
          <div
            className={`absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-black backdrop-blur ${
              isUrgent ? "text-[var(--color-danger)]" : "text-white/50"
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
          <p className="truncate text-sm font-black text-white">
            {getListingLabel(listing)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
            <MapPin className="h-3 w-3" />
            {listing?.city || listing?.state_code || "—"}
            {listing?.state_code ? `, ${listing.state_code}` : ""}
            {listing?.zip_code ? ` ${listing.zip_code}` : ""}
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
              className="rounded-xl border border-white/8 bg-white/[0.04] p-2 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/35">
                {stat.label}
              </p>
              <p
                className={`mt-0.5 text-[12px] font-black ${
                  stat.highlight ? "text-[#6ee7b7]" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Property details */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
          {listing?.beds_count > 0 && <span>{listing.beds_count} beds</span>}
          {listing?.baths_count > 0 && <span>{listing.baths_count} baths</span>}
          {listing?.square_footage && (
            <span>{Number(listing.square_footage).toLocaleString()} sqft</span>
          )}
          {listing?.property_type && <span>{listing.property_type}</span>}
        </div>

        {/* Bid cap */}
        <BidCapBar bidCount={bidCount} maxBids={maxBids} />

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            to={`/properties/${id}`}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-white/25 hover:text-white"
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
              className="flex-1 rounded-xl bg-[var(--color-secondary)] py-2.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              Submit Bid
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const PROPERTY_TYPES = ["All Types", "sfh", "multi_family", "land"];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  "All Types": "All Types",
  sfh: "Single Family",
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

export default function PropertyStreamPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedState, setSelectedState] = useState("All States");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch listings — backend supports: page, limit, state_code, property_type, min_price, max_price
  // No status filter exists on backend — live/paused filtering done client-side
  const { data, isLoading, isFetching, refetch } = useGetListingsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const allListings = normalizeListings(data);


  // Client-side filter + sort
  const filtered = allListings
    .filter((l) => {
      const matchSearch =
        !search ||
        getListingLabel(l).toLowerCase().includes(search.toLowerCase()) ||
        String(l?.state_code || "").toLowerCase().includes(search.toLowerCase()) ||
        String(l?.city || "").toLowerCase().includes(search.toLowerCase());
      const matchType =
        selectedType === "All Types" || l?.property_type === selectedType;
      const matchState =
        selectedState === "All States" || l?.state_code === selectedState;
      return matchSearch && matchType && matchState;
    })
    .sort((a, b) => {
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
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Live Deal Stream
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
              Property Stream
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Browse off-market opportunities. Each property is capped at 10
              offers — act fast.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
              <Building2 className="h-4 w-4 text-[var(--color-secondary)]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Available
                </p>
                <p className="text-xl font-black text-white">
                  {isLoading ? "—" : allListings.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
              <Flame className="h-4 w-4 text-[var(--color-danger)]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Hot Deals
                </p>
                <p className="text-xl font-black text-white">
                  {isLoading ? "—" : hotDeals}
                </p>
              </div>
            </div>

            {avgMargin > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                <TrendingUp className="h-4 w-4 text-[#6ee7b7]" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
                    Avg Margin
                  </p>
                  <p className="text-xl font-black text-[#6ee7b7]">{avgMargin}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]/50">
          <Search className="h-4 w-4 shrink-0 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, city, state..."
            className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${
            showFilters
              ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
              : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#1a1e24] px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-white outline-none focus:border-[var(--color-secondary)]/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1a1e24]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Property Type
            </p>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${
                    selectedType === type
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                      : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {PROPERTY_TYPE_LABELS[type] || type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              State
            </p>
            <div className="flex flex-wrap gap-2">
              {STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setSelectedState(state)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${
                    selectedState === state
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                      : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
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
        <p className="text-[11px] font-semibold text-white/40">
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
            <p className="mt-3 text-sm font-semibold text-white/40">
              Loading property stream...
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-white/20" />
          <p className="mt-3 text-sm font-bold text-white/40">
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
              />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
            >
              Refresh for Latest Deals
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

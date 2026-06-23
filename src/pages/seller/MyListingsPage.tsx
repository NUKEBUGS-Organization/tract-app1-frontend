import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  Gavel,
  Home,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { PageSkeleton } from "../../components/common/Skeleton";

import StatusBadge from "../../components/common/StatusBadge";
import { useGetListingsDashboardQuery } from "../../services/listingService";

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "neutral"
  | "dark";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Live", value: "live" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Under Contract", value: "under_contract" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
];

const PROPERTY_TYPE_FILTERS = [
  { label: "All Types", value: "all" },
  { label: "Single Family", value: "sfh" },
  { label: "Multi Family", value: "multi_family" },
  { label: "Land", value: "land" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price High to Low", value: "price_high" },
  { label: "Price Low to High", value: "price_low" },
  { label: "Most Bids", value: "most_bids" },
];

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingsFromResponse(response: any): any[] {
  const payload = getApiPayload(response);

  if (!payload) return [];

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload?.data)) return payload.data;

  if (payload?.listings && typeof payload.listings === "object") {
    return Object.values(payload.listings);
  }

  return [];
}

function getId(listing: any) {
  return String(listing?._id || listing?.id || "");
}

function getStatus(listing: any) {
  return String(listing?.status || "draft").toLowerCase();
}

function isEditableListing(listing: any) {
  const status = getStatus(listing);
  return status === "draft" || status === "withdrawn";
}

function formatStatus(status?: string) {
  if (!status) return "Draft";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusVariant(status?: string): StatusBadgeVariant {
  const normalizedStatus = String(status || "draft").toLowerCase();

  if (normalizedStatus === "live") return "success";
  if (normalizedStatus === "draft") return "neutral";
  if (normalizedStatus === "submitted") return "gold";
  if (normalizedStatus === "under_contract") return "warning";
  if (normalizedStatus === "closed") return "dark";
  if (normalizedStatus === "withdrawn") return "danger";
  if (normalizedStatus === "rejected") return "danger";
  if (normalizedStatus === "paused") return "warning";

  return "neutral";
}

function formatMoney(value: any) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "-";

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// function formatDate(value?: string) {
//   if (!value) return "-";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return "-";

//   return date.toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// }

function formatShortDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatPropertyType(type?: string) {
  const normalized = String(type || "").toLowerCase();

  const labels: Record<string, string> = {
    sfh: "Single Family Home",
    multi_family: "Multi Family",
    land: "Land",
  };

  return labels[normalized] || type || "-";
}

function getListingTitle(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getBidCount(listing: any) {
  return (
    Number(listing?.bid_count) ||
    Number(listing?.bids_summary?.total) ||
    Number(Array.isArray(listing?.bids) ? listing.bids.length : 0)
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <p className="font-serif text-3xl font-black text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

function IconAction({
  to,
  label,
  icon: Icon,
  variant = "light",
}: {
  to: string;
  label: string;
  icon: any;
  variant?: "light" | "primary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 ${
        isPrimary
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-card)]"
          : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
      }`}
    >
      <Icon className="h-4 w-4" />

      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

export default function MyListingsPage() {
  const { data, isLoading } = useGetListingsDashboardQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const listings = useMemo(() => getListingsFromResponse(data), [data]);

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = listings.filter((listing: any) => {
      const status = getStatus(listing);
      const propertyType = String(listing?.property_type || "").toLowerCase();

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const matchesType =
        propertyTypeFilter === "all" || propertyType === propertyTypeFilter;

      const title = getListingTitle(listing).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        String(listing?.state_code || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(listing?.zip_code || "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesType && matchesSearch;
    });

    return filtered.sort((a: any, b: any) => {
      if (sortBy === "oldest") {
        return (
          new Date(a?.createdAt || a?.created_at || 0).getTime() -
          new Date(b?.createdAt || b?.created_at || 0).getTime()
        );
      }

      if (sortBy === "price_high") {
        return Number(b?.market_price || 0) - Number(a?.market_price || 0);
      }

      if (sortBy === "price_low") {
        return Number(a?.market_price || 0) - Number(b?.market_price || 0);
      }

      if (sortBy === "most_bids") {
        return getBidCount(b) - getBidCount(a);
      }

      return (
        new Date(b?.createdAt || b?.created_at || 0).getTime() -
        new Date(a?.createdAt || a?.created_at || 0).getTime()
      );
    });
  }, [listings, searchTerm, statusFilter, propertyTypeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const displayStart = filteredListings.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, filteredListings.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, propertyTypeFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    return {
      total: listings.length,
      draft: listings.filter((item: any) => getStatus(item) === "draft")
        .length,
      submitted: listings.filter(
        (item: any) => getStatus(item) === "submitted"
      ).length,
      live: listings.filter((item: any) => getStatus(item) === "live").length,
      withdrawn: listings.filter(
        (item: any) => getStatus(item) === "withdrawn"
      ).length,
    };
  }, [listings]);

  const hasFilters =
    searchTerm.trim() ||
    statusFilter !== "all" ||
    propertyTypeFilter !== "all" ||
    sortBy !== "newest";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPropertyTypeFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

if (isLoading) {
  return <PageSkeleton />;
}

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
          Seller Portal
        </p>

        <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
          My Listings
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
          Manage your full listing history in one place. Use filters to find
          draft, submitted, live, withdrawn, under contract, or closed listings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={Building2} />
        <StatCard label="Draft" value={stats.draft} icon={FileText} />
        <StatCard label="Submitted" value={stats.submitted} icon={Clock} />
        <StatCard label="Live" value={stats.live} icon={Home} />
        <StatCard label="Withdrawn" value={stats.withdrawn} icon={ArrowUpDown} />
      </div>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-primary)]" />

            <div>
              <h2 className="text-sm font-black text-[var(--color-primary)]">
                Filters
              </h2>

              <p className="text-xs text-[var(--color-text-muted)]">
                Search, filter, and sort your seller listings.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-danger)] transition hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/5"
            >
              <XCircle className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search address, state, or ZIP..."
              className="w-full border border-[var(--color-border-light)] bg-white px-11 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary)]"
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={propertyTypeFilter}
            onChange={(event) => setPropertyTypeFilter(event.target.value)}
            className="w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary)]"
          >
            {PROPERTY_TYPE_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary)]"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                Sort: {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--color-border-light)] px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              Listings
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Showing {displayStart}-{displayEnd} of {filteredListings.length}{" "}
              listings.
            </p>
          </div>

          <div className="rounded-full bg-[var(--color-bg-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Page {safePage} / {totalPages}
          </div>
        </div>

        {paginatedListings.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />

            <h3 className="mt-4 font-serif text-xl font-black text-[var(--color-primary)]">
              No listings found
            </h3>

            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Try changing filters to see more results.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-light)]">
           {paginatedListings.length === 0 ? (
  <div className="p-10 text-center">
    <Building2 className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />

    <h3 className="mt-4 font-serif text-xl font-black text-[var(--color-primary)]">
      No listings found
    </h3>

    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
      Try changing filters to see more results.
    </p>
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[980px] text-left">
      <thead className="bg-[var(--color-bg-soft)]">
        <tr>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Property
          </th>

          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Type
          </th>

          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Status
          </th>

          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Price
          </th>

          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Bids
          </th>

          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Created
          </th>

          <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {paginatedListings.map((listing: any) => {
          const listingId = getId(listing);
          const editable = isEditableListing(listing);
          const status = getStatus(listing);

          return (
            <tr
              key={listingId}
              className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/70"
            >
              <td className="px-6 py-5">
                <Link
                  to={`/properties/${listingId}`}
                  className="block font-serif text-lg font-black text-[var(--color-primary)] transition hover:text-[var(--color-secondary)]"
                >
                  {listing?.address || "Untitled Listing"}
                </Link>

                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {listing?.state_code || "-"}
                  {listing?.zip_code ? ` ${listing.zip_code}` : ""}
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-black text-[var(--color-text-main)]">
                  {formatPropertyType(listing?.property_type)}
                </p>
              </td>

              <td className="px-6 py-5">
                <StatusBadge
                  label={formatStatus(status)}
                  variant={getStatusVariant(status)}
                />
              </td>

              <td className="px-6 py-5">
                <p className="font-serif text-lg font-black text-[var(--color-primary)]">
                  {formatMoney(listing?.market_price)}
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="font-serif text-lg font-black text-[var(--color-primary)]">
                  {getBidCount(listing)}
                </p>
              </td>

              <td className="px-6 py-5">
                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                  {formatShortDate(listing?.createdAt || listing?.created_at)}
                </p>
              </td>

              <td className="px-6 py-5">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <IconAction
                    to={`/properties/${listingId}`}
                    label="View"
                    icon={Eye}
                  />

                  {editable && (
                    <IconAction
                      to={`/properties/${listingId}/edit`}
                      label="Edit"
                      icon={Edit3}
                      variant="primary"
                    />
                  )}

                  <IconAction
                    to={`/document-vault?listingId=${listingId}`}
                    label="Docs"
                    icon={FileText}
                  />

                  <IconAction
                    to={`/bids?listingId=${listingId}`}
                    label="Bids"
                    icon={Gavel}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-6 py-5 sm:flex-row">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            Showing {displayStart}-{displayEnd} of {filteredListings.length}.
            Maximum {PAGE_SIZE} listings per page.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-primary)]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[var(--color-primary)] shadow-sm">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-primary)]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
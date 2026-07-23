// src/pages/admin/AdminBidsPage.tsx

import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  DollarSign,
  Eye,
  FilterX,
  Gavel,
  Inbox,
  RefreshCcw,
  Search,
  UserRound,
} from "lucide-react";

import { useGetAdminBidsQuery } from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  formatDate,
  formatMoney,
  getApiList,
  getApiPagination,
  getMongoId,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

type BidFilter =
  | "all"
  | "active"
  | "selected"
  | "backup"
  | "rejected"
  | "deleted";

const BID_FILTERS: Array<{
  label: string;
  value: BidFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Selected", value: "selected" },
  { label: "Backup", value: "backup" },
  { label: "Rejected", value: "rejected" },
  { label: "Deleted", value: "deleted" },
];

function formatStatusLabel(status: string) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBidderName(bid: any) {
  return (
    bid?.bidder_id?.fullName || bid?.bidder_id?.full_name ||
    
    "-"
  );
}

function getBidderEmail(bid: any) {
  return bid?.bidder_id?.email || "-";
}

function getPropertyAddress(bid: any) {
  return (
    bid?.property_id?.address ||
    bid?.property_id?.property_address ||
    bid?.property_id?.street_address ||
    "-"
  );
}

function getPropertyLocation(bid: any) {
  const property = bid?.property_id;

  return (
    [property?.city, property?.state_code || property?.state]
      .filter(Boolean)
      .join(", ") || ""
  );
}

function getBidPrice(bid: any) {
  return bid?.bid_price ?? bid?.bidPrice ?? bid?.amount ?? null;
}

function getBidStatus(bid: any) {
  return bid?.status || "unknown";
}

function getBackupPosition(bid: any) {
  return bid?.backup_position ?? bid?.backupPosition ?? null;
}

function getBidderRole(bid: any) {
  return (
    bid?.bidder_id?.role ||
    bid?.bidder_id?.user_role ||
    bid?.bidder_type ||
    bid?.bidderType ||
    ""
  );
}

function getTotalAmount(bids: any[]) {
  return bids.reduce((total, bid) => {
    const value = Number(getBidPrice(bid));

    if (!Number.isFinite(value)) return total;

    return total + value;
  }, 0);
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  featured = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-4 shadow-[var(--shadow-card)] transition-all duration-200 ${
        featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 break-words text-lg font-black leading-tight ${
              featured ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {helper}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white/10 text-white"
              : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function AdminBidFilters({
  searchValue,
  filter,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onClear,
}: {
  searchValue: string;
  filter: BidFilter;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: BidFilter) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-bid-search" className="sr-only">
            Search bids
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-bid-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by bidder, email, property, status, or amount..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="admin-bid-status-filter" className="sr-only">
            Filter by bid status
          </label>

          <select
            id="admin-bid-status-filter"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as BidFilter)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            {BID_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} bids
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={onClear}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{" "}
          <strong className="text-[var(--color-primary)]">{shownCount}</strong>{" "}
          of{" "}
          <strong className="text-[var(--color-primary)]">{totalCount}</strong>{" "}
          bids on this page.
        </span>

        {hasActiveFilters && (
          <span className="text-[var(--color-primary)]">
            Filters are applied to the current loaded page.
          </span>
        )}
      </div>
    </section>
  );
}

function ViewBidButton({ bid }: { bid: any }) {
  const bidId = getMongoId(bid);

  return (
    <Link
      to={`/bids/${bidId}`}
      state={{ bid }}
      aria-label="View bid details"
      title="View Details"
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] transition-all duration-200 hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        View Details
      </span>
    </Link>
  );
}

function AdminBidCard({ bid }: { bid: any }) {
  const bidId = getMongoId(bid);
  const bidAmount = getBidPrice(bid);
  const status = getBidStatus(bid);
  const propertyLocation = getPropertyLocation(bid);
  const backupPosition = getBackupPosition(bid);
  const bidderRole = getBidderRole(bid);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/bids/${bidId}`}
            state={{ bid }}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {getBidderName(bid)}
          </Link>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {getBidderEmail(bid)}
          </p>
        </div>

        <StatusBadge
          label={formatStatusLabel(status)}
          variant={getStatusVariant(status)}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--color-bg-soft)] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Property
        </p>

        <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
          {getPropertyAddress(bid)}
        </p>

        {propertyLocation && (
          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            {propertyLocation}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Amount
          </p>

          <p className="mt-1 text-base font-black text-[var(--color-primary)]">
            {formatMoney(bidAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {formatDate(bid.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Type
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {backupPosition ? `Backup #${backupPosition}` : bidderRole || "-"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/bids/${bidId}`}
          state={{ bid }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Details
        </Link>
      </div>
    </article>
  );
}

function AdminBidsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<BidFilter>("all");
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminBidsQuery({
    page,
    limit: 20,
  });

  const allBids = getApiList(data);

  const statusFilteredBids =
    filter === "all"
      ? allBids
      : allBids.filter(
          (bid: any) => normalizeValue(getBidStatus(bid)) === filter
        );

  const bids = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return statusFilteredBids;

    return statusFilteredBids.filter((bid: any) => {
      const searchText = [
        getBidderName(bid),
        getBidderEmail(bid),
        getPropertyAddress(bid),
        getPropertyLocation(bid),
        formatStatusLabel(getBidStatus(bid)),
        formatMoney(getBidPrice(bid)),
        getBidPrice(bid),
        getBidderRole(bid),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [statusFilteredBids, searchValue]);

  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const hasActiveFilters = filter !== "all" || searchValue.trim().length > 0;

  const selectedCount = allBids.filter(
    (bid: any) => normalizeValue(getBidStatus(bid)) === "selected"
  ).length;

  const activeCount = allBids.filter(
    (bid: any) => normalizeValue(getBidStatus(bid)) === "active"
  ).length;

  const pageTotalAmount = getTotalAmount(bids);

  function clearFilters() {
    setFilter("all");
    setSearchValue("");
    setPage(1);
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Bid Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Bids
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review bidder activity, compare bid amounts, and open bid records
              for deeper admin inspection.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              {formatStatusLabel(filter)} Bids
            </p>
          </div>
        </div>
      </section>

      {!isLoading && !isError && allBids.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Bids"
              value={bids.length}
              helper="After current filters"
              featured
              icon={<Gavel className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Page Value"
              value={formatMoney(pageTotalAmount)}
              helper="Total visible bid value"
              icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Selected"
              value={selectedCount}
              helper="Selected bids on page"
              icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Active"
              value={activeCount}
              helper="Active bids on page"
              icon={<Inbox className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminBidFilters
            searchValue={searchValue}
            filter={filter}
            shownCount={bids.length}
            totalCount={allBids.length}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchValue}
            onFilterChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
            onClear={clearFilters}
          />
        </>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading bids..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load bids
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading the bid queue.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="justify-center"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : bids.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <Gavel className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No bids found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No bids match your current search or filter selection."
              : "There are no bids available right now."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 2xl:hidden">
            {bids.map((bid: any) => (
              <AdminBidCard key={getMongoId(bid)} bid={bid} />
            ))}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Bid Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Open bid records to inspect bidder, property, and offer
                    details.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {bids.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[24%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Bidder
                  </th>

                  <th className="w-[30%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Property
                  </th>

                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Amount
                  </th>

                  <th className="w-[13%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="w-[12%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Created
                  </th>

                  <th className="w-[6%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {bids.map((bid: any) => {
                  const bidId = getMongoId(bid);
                  const bidAmount = getBidPrice(bid);
                  const status = getBidStatus(bid);
                  const propertyLocation = getPropertyLocation(bid);

                  return (
                    <tr
                      key={bidId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/bids/${bidId}`}
                          state={{ bid }}
                          className="line-clamp-1 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {getBidderName(bid)}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getBidderEmail(bid)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          to={`/bids/${bidId}`}
                          state={{ bid }}
                          className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)] transition-colors hover:text-[var(--color-secondary)]"
                        >
                          {getPropertyAddress(bid)}
                        </Link>

                        {propertyLocation && (
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                            {propertyLocation}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm font-black text-[var(--color-primary)]">
                        {formatMoney(bidAmount)}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatStatusLabel(status)}
                          variant={getStatusVariant(status)}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        {formatDate(bid.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <ViewBidButton bid={bid} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Page{" "}
          <span className="font-black text-[var(--color-primary)]">
            {pagination.page}
          </span>{" "}
          of{" "}
          <span className="font-black text-[var(--color-primary)]">
            {totalPages}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="justify-center"
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="justify-center"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminBidsPage;
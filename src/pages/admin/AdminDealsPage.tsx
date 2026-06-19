import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Calendar,
  CheckCircle,
  Clock3,
  Eye,
  FilterX,
  Handshake,
  Home,
  LockKeyhole,
  RefreshCcw,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useCloseAdminDealMutation,
  useGetAdminDealsQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  formatDate,
  getApiList,
  getApiPagination,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

type DealFilter = "all" | string;

function getDealDoc(deal: any) {
  return deal?._doc ?? deal?.data?._doc ?? deal;
}

function getDealId(deal: any) {
  const doc = getDealDoc(deal);
  return getMongoId(doc) || doc?._id || "";
}

function getDealStatus(deal: any) {
  const doc = getDealDoc(deal);
  return doc?.status || "unknown";
}

function getDealProperty(deal: any) {
  const doc = getDealDoc(deal);
  return doc?.listing_id ?? doc?.property_id ?? null;
}

function getDealPropertyLocation(deal: any) {
  const property = getDealProperty(deal);

  return (
    [property?.city, property?.state_code || property?.state]
      .filter(Boolean)
      .join(", ") || ""
  );
}

function getDealSeller(deal: any) {
  const doc = getDealDoc(deal);
  return doc?.seller_id ?? null;
}

function getDealBuyer(deal: any) {
  const doc = getDealDoc(deal);
  return doc?.buyer_id ?? null;
}

function formatStatusLabel(status: string) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function canCloseDeal(status: string) {
  return normalizeValue(status) !== "closed";
}

function isClosedDeal(deal: any) {
  return normalizeValue(getDealStatus(deal)) === "closed";
}

function isActiveDeal(deal: any) {
  const status = normalizeValue(getDealStatus(deal));

  return status !== "closed" && status !== "cancelled" && status !== "deleted";
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
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-4 shadow-[var(--shadow-card)] transition-all duration-200 ${featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border-light)] bg-white"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${featured ? "text-white/65" : "text-[var(--color-text-muted)]"
              }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 break-words text-lg font-black leading-tight ${featured ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${featured ? "text-white/65" : "text-[var(--color-text-muted)]"
              }`}
          >
            {helper}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${featured
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

function ActionIconButton({
  label,
  icon,
  variant = "neutral",
  isLoading = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant?: "neutral" | "danger";
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isDisabled = disabled || isLoading;

  const variantClasses =
    variant === "danger"
      ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
      : "border-[var(--color-border-light)] bg-white text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)]";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      className={`group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses}`}
    >
      <span className="sr-only">{label}</span>

      {isLoading ? (
        <RefreshCcw className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}

      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  );
}

function ViewDealButton({ deal }: { deal: any }) {
  const dealId = getDealId(deal);

  return (
    <Link
      to={`/deals/${dealId}`}
      state={{ deal }}
      aria-label="View deal details"
      title="View Details"
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] transition-all duration-200 hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <Eye className="h-4 w-4" aria-hidden="true" />

      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        View Details
      </span>
    </Link>
  );
}

function AdminDealFilters({
  searchValue,
  filter,
  dealFilters,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onClear,
}: {
  searchValue: string;
  filter: DealFilter;
  dealFilters: Array<{ label: string; value: string }>;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-deal-search" className="sr-only">
            Search deals
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-deal-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by property, seller, buyer, status, or deal ID..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="admin-deal-status-filter" className="sr-only">
            Filter by deal status
          </label>

          <select
            id="admin-deal-status-filter"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            {dealFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} deals
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
          deals on this page.
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

function AdminDealCard({
  deal,
  isClosing,
  onClose,
}: {
  deal: any;
  isClosing: boolean;
  onClose: (deal: any) => void;
}) {
  const dealId = getDealId(deal);
  const status = normalizeValue(getDealStatus(deal));
  const property = getDealProperty(deal);
  const propertyLocation = getDealPropertyLocation(deal);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/deals/${dealId}`}
            state={{ deal }}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {getListingTitle(property)}
          </Link>

          {propertyLocation ? (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
              {propertyLocation}
            </p>
          ) : (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
              ID: {dealId}
            </p>
          )}
        </div>

        <StatusBadge
          label={formatStatusLabel(status)}
          variant={getStatusVariant(status)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
            {getPersonName(getDealSeller(deal))}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Buyer
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
            {getPersonName(getDealBuyer(deal))}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {formatDate(getDealDoc(deal)?.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Deal ID
          </p>

          <p className="mt-1 truncate text-sm font-bold text-[var(--color-text-main)]">
            {dealId || "-"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          to={`/deals/${dealId}`}
          state={{ deal }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Details
        </Link>

        {canCloseDeal(status) && (
          <Button
            type="button"
            variant="danger"
            isLoading={isClosing}
            disabled={isClosing}
            onClick={() => onClose(deal)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <LockKeyhole className="h-4 w-4" />
            Close Deal
          </Button>
        )}
      </div>
    </article>
  );
}

function AdminDealsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<DealFilter>("all");
  const [searchValue, setSearchValue] = useState("");

  const [closeTarget, setCloseTarget] = useState<any | null>(null);
  const [processingDealId, setProcessingDealId] = useState("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAdminDealsQuery({
    page,
    limit: 20,
  });

  const [closeDeal, { isLoading: isClosing }] = useCloseAdminDealMutation();

  const allDeals = getApiList(data);

  const availableStatuses = Array.from(
    new Set(
      allDeals
        .map((deal: any) => normalizeValue(getDealStatus(deal)))
        .filter(Boolean)
    )
  ) as string[];

  const dealFilters = [
    {
      label: "All",
      value: "all",
    },
    ...availableStatuses.map((status) => ({
      label: formatStatusLabel(status),
      value: status,
    })),
  ];

  const statusFilteredDeals =
    filter === "all"
      ? allDeals
      : allDeals.filter(
        (deal: any) => normalizeValue(getDealStatus(deal)) === filter
      );

  const deals = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return statusFilteredDeals;

    return statusFilteredDeals.filter((deal: any) => {
      const property = getDealProperty(deal);

      const searchText = [
        getDealId(deal),
        getListingTitle(property),
        getDealPropertyLocation(deal),
        getPersonName(getDealSeller(deal)),
        getPersonName(getDealBuyer(deal)),
        formatStatusLabel(getDealStatus(deal)),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [statusFilteredDeals, searchValue]);

  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const hasActiveFilters = filter !== "all" || searchValue.trim().length > 0;

  const activeCount = allDeals.filter((deal: any) => isActiveDeal(deal)).length;
  const closedCount = allDeals.filter((deal: any) => isClosedDeal(deal)).length;
  const closableCount = allDeals.filter((deal: any) =>
    canCloseDeal(getDealStatus(deal))
  ).length;

  function clearFilters() {
    setFilter("all");
    setSearchValue("");
    setPage(1);
  }

  async function handleCloseDeal() {
    if (!closeTarget) return;

    const dealId = getDealId(closeTarget);

    try {
      setProcessingDealId(dealId);

      await closeDeal(dealId).unwrap();

      setCloseTarget(null);

      await refetch();
    } finally {
      setProcessingDealId("");
    }
  }

  const closeTargetId = closeTarget ? getDealId(closeTarget) : "";

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Deal Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Deals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Monitor platform deals, review buyer-seller progress, and close
              deals when admin intervention is required.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              {formatStatusLabel(filter)} Deals
            </p>
          </div>
        </div>
      </section>

      {!isLoading && !isError && allDeals.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Deals"
              value={deals.length}
              helper="After current filters"
              featured
              icon={<Handshake className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Active Deals"
              value={activeCount}
              helper="Not closed/cancelled"
              icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Closed Deals"
              value={closedCount}
              helper="Completed or force closed"
              icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Closable"
              value={closableCount}
              helper="Eligible for close action"
              icon={<LockKeyhole className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminDealFilters
            searchValue={searchValue}
            filter={filter}
            dealFilters={dealFilters}
            shownCount={deals.length}
            totalCount={allDeals.length}
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
          <Loader label="Loading deals..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load deals
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading deal records.
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
      ) : deals.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <Handshake className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No deals found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No deals match your current search or filter selection."
              : "There are no platform deals available right now."}
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
            {deals.map((deal: any) => {
              const dealId = getDealId(deal);

              return (
                <AdminDealCard
                  key={dealId}
                  deal={deal}
                  isClosing={isClosing && processingDealId === dealId}
                  onClose={setCloseTarget}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Deal Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Open deal records or close deals that require admin action.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {deals.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[28%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Deal
                  </th>

                  <th className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Seller
                  </th>

                  <th className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Buyer
                  </th>

                  <th className="w-[14%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="w-[12%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Created
                  </th>

                  <th className="w-[10%] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {deals.map((deal: any) => {
                  const dealId = getDealId(deal);
                  const status = normalizeValue(getDealStatus(deal));
                  const property = getDealProperty(deal);
                  const propertyLocation = getDealPropertyLocation(deal);

                  const isThisClosing =
                    isClosing && processingDealId === dealId;

                  return (
                    <tr
                      key={dealId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/deals/${dealId}`}
                          state={{ deal }}
                          className="line-clamp-1 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {getListingTitle(property)}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {propertyLocation || dealId}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getPersonName(getDealSeller(deal))}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getPersonName(getDealBuyer(deal))}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatStatusLabel(status)}
                          variant={getStatusVariant(status)}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        {formatDate(getDealDoc(deal)?.createdAt)}
                      </td>

                     <td className="px-4 py-5">
  <div className="flex min-w-[92px] items-center justify-center gap-2">
    <ViewDealButton deal={deal} />

    {canCloseDeal(status) && (
      <ActionIconButton
        label="Close Deal"
        variant="danger"
        isLoading={isThisClosing}
        disabled={isThisClosing}
        onClick={() => setCloseTarget(deal)}
        icon={
          <LockKeyhole
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          />
        }
      />
    )}
  </div>
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

      <ConfirmModal
        isOpen={Boolean(closeTarget)}
        variant="danger"
        title="Force close deal?"
        description={`Are you sure you want to close "${closeTarget
            ? getListingTitle(getDealProperty(closeTarget))
            : "this deal"
          }"?`}
        icon={<LockKeyhole className="h-5 w-5" />}
        confirmLabel="Close Deal"
        loadingLabel="Closing..."
        isLoading={isClosing && processingDealId === closeTargetId}
        onCancel={() => {
          if (!isClosing) {
            setCloseTarget(null);
          }
        }}
        onConfirm={handleCloseDeal}
      />
    </div>
  );
}

export default AdminDealsPage;
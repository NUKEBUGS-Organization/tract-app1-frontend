import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  CheckCircle,
  Clock3,
  Eye,
  FileText,
  FilterX,
  RefreshCcw,
  Search,
  
} from "lucide-react";

import { useGetAdminContractsQuery } from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  formatDate,
  getApiList,
  getApiPagination,
  getMongoId,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

type ContractFilter = "all" | string;

function formatStatusLabel(status: string) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getContractDoc(contract: any) {
  return contract?._doc ?? contract?.data?._doc ?? contract;
}

function getContractId(contract: any) {
  const doc = getContractDoc(contract);
  return getMongoId(doc) || doc?._id || "";
}

function getContractStatus(contract: any) {
  const doc = getContractDoc(contract);
  return doc?.status || "unknown";
}

function getContractProperty(contract: any) {
  const doc = getContractDoc(contract);
  return doc?.property_id || doc?.property || doc?.listing_id || {};
}

function getContractPropertyName(contract: any) {
  const property = getContractProperty(contract);

  return (
    property?.address ||
    property?.property_address ||
    property?.street_address ||
    property?.title ||
    "Listing"
  );
}

function getContractPropertyLocation(contract: any) {
  const property = getContractProperty(contract);

  return (
    [property?.city, property?.state_code || property?.state]
      .filter(Boolean)
      .join(", ") || ""
  );
}

function getContractSeller(contract: any) {
  const doc = getContractDoc(contract);
  return doc?.seller_id || doc?.seller || {};
}

function getContractBuyer(contract: any) {
  const doc = getContractDoc(contract);
  return doc?.buyer_id || doc?.buyer || doc?.wholesaler_id || {};
}

function getContractSellerName(contract: any) {
  const seller = getContractSeller(contract);

  return (
    seller?.fullName || seller?.full_name ||
    seller?.fullName ||
    seller?.name ||
    "-"
  );
}

function getContractBuyerName(contract: any) {
  const buyer = getContractBuyer(contract);

  return (
    buyer?.fullName || buyer?.full_name ||
    buyer?.fullName ||
    buyer?.name ||
    "-"
  );
}

function getContractSellerEmail(contract: any) {
  const seller = getContractSeller(contract);
  return seller?.email || "";
}

function getContractBuyerEmail(contract: any) {
  const buyer = getContractBuyer(contract);
  return buyer?.email || "";
}

function isCompletedContract(contract: any) {
  const status = normalizeValue(getContractStatus(contract));

  return ["signed", "fully_signed", "completed", "closed"].includes(status);
}

function isActionNeededContract(contract: any) {
  const status = normalizeValue(getContractStatus(contract));

  return [
    "draft",
    "generated",
    "pending",
    "sent",
    "awaiting_signature",
    "partially_signed",
    "seller_signed",
    "buyer_signed",
  ].includes(status);
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

function ViewContractButton({ contract }: { contract: any }) {
  const contractId = getContractId(contract);

  return (
    <Link
      to={`/contracts/${contractId}`}
      state={{ contract }}
      aria-label="View contract details"
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

function AdminContractFilters({
  searchValue,
  filter,
  contractFilters,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onClear,
}: {
  searchValue: string;
  filter: ContractFilter;
  contractFilters: Array<{ label: string; value: string }>;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_240px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-contract-search" className="sr-only">
            Search contracts
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-contract-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by property, seller, buyer, status, or contract ID..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="admin-contract-status-filter" className="sr-only">
            Filter by contract status
          </label>

          <select
            id="admin-contract-status-filter"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            {contractFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} contracts
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
          contracts on this page.
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

function AdminContractCard({ contract }: { contract: any }) {
  const contractId = getContractId(contract);
  const status = getContractStatus(contract);
  const propertyName = getContractPropertyName(contract);
  const propertyLocation = getContractPropertyLocation(contract);
  const sellerEmail = getContractSellerEmail(contract);
  const buyerEmail = getContractBuyerEmail(contract);
  const doc = getContractDoc(contract);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/contracts/${contractId}`}
            state={{ contract }}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {propertyName}
          </Link>

          {propertyLocation && (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
              {propertyLocation}
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
            {getContractSellerName(contract)}
          </p>

          {sellerEmail && (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
              {sellerEmail}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Buyer
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
            {getContractBuyerName(contract)}
          </p>

          {buyerEmail && (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
              {buyerEmail}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {formatDate(doc?.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Contract ID
          </p>

          <p className="mt-1 truncate text-sm font-bold text-[var(--color-text-main)]">
            {contractId || "-"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/contracts/${contractId}`}
          state={{ contract }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Details
        </Link>
      </div>
    </article>
  );
}

function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ContractFilter>("all");
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminContractsQuery({
    page,
    limit: 20,
  });

  const allContracts = getApiList(data);

  const availableStatuses = Array.from(
    new Set(
      allContracts
        .map((contract: any) => normalizeValue(getContractStatus(contract)))
        .filter(Boolean)
    )
  ) as string[];

  const contractFilters = [
    { label: "All", value: "all" },
    ...availableStatuses.map((status) => ({
      label: formatStatusLabel(status),
      value: status,
    })),
  ];

  const statusFilteredContracts =
    filter === "all"
      ? allContracts
      : allContracts.filter(
          (contract: any) => normalizeValue(getContractStatus(contract)) === filter
        );

  const contracts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return statusFilteredContracts;

    return statusFilteredContracts.filter((contract: any) => {
      const searchText = [
        getContractId(contract),
        getContractPropertyName(contract),
        getContractPropertyLocation(contract),
        getContractSellerName(contract),
        getContractSellerEmail(contract),
        getContractBuyerName(contract),
        getContractBuyerEmail(contract),
        formatStatusLabel(getContractStatus(contract)),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [statusFilteredContracts, searchValue]);

  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const hasActiveFilters = filter !== "all" || searchValue.trim().length > 0;

  const completedCount = allContracts.filter((contract: any) =>
    isCompletedContract(contract)
  ).length;

  const actionNeededCount = allContracts.filter((contract: any) =>
    isActionNeededContract(contract)
  ).length;

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
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Contract Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Contracts
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review generated contracts, track signing status, and inspect
              buyer-seller agreements from one place.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              {formatStatusLabel(filter)} Contracts
            </p>
          </div>
        </div>
      </section>

      {!isLoading && !isError && allContracts.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Contracts"
              value={contracts.length}
              helper="After current filters"
              featured
              icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Need Action"
              value={actionNeededCount}
              helper="Pending signing/review"
              icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Completed"
              value={completedCount}
              helper="Signed or closed"
              icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="This Page"
              value={allContracts.length}
              helper="Loaded contract records"
              icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminContractFilters
            searchValue={searchValue}
            filter={filter}
            contractFilters={contractFilters}
            shownCount={contracts.length}
            totalCount={allContracts.length}
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
          <Loader label="Loading contracts..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load contracts
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading contract records.
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
      ) : contracts.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No contracts found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No contracts match your current search or filter selection."
              : "There are no generated contracts available right now."}
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
            {contracts.map((contract: any) => (
              <AdminContractCard
                key={getContractId(contract)}
                contract={contract}
              />
            ))}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Contract Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Open contract records to inspect property, parties, and
                    signing status.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {contracts.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[30%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Property
                  </th>

                  <th className="w-[20%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Seller
                  </th>

                  <th className="w-[20%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Buyer
                  </th>

                  <th className="w-[14%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="w-[10%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Created
                  </th>

                  <th className="w-[6%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {contracts.map((contract: any) => {
                  const contractId = getContractId(contract);
                  const doc = getContractDoc(contract);
                  const status = getContractStatus(contract);
                  const propertyLocation = getContractPropertyLocation(contract);

                  return (
                    <tr
                      key={contractId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/contracts/${contractId}`}
                          state={{ contract }}
                          className="line-clamp-1 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {getContractPropertyName(contract)}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {propertyLocation || contractId}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getContractSellerName(contract)}
                        </p>

                        {getContractSellerEmail(contract) && (
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                            {getContractSellerEmail(contract)}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getContractBuyerName(contract)}
                        </p>

                        {getContractBuyerEmail(contract) && (
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                            {getContractBuyerEmail(contract)}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatStatusLabel(status)}
                          variant={getStatusVariant(status)}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        {formatDate(doc?.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <ViewContractButton contract={contract} />
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

export default AdminContractsPage;
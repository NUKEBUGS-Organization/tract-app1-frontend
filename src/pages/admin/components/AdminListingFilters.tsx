import { Search, X } from "lucide-react";

type StatusOption = {
  label: string;
  value: string;
};

function AdminListingFilters({
  searchValue,
  statusFilter,
  cityFilter,
  cityOptions,
  statusOptions,
  hasActiveFilters,
  shownCount,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onCityFilterChange,
  onClear,
}: {
  searchValue: string;
  statusFilter: string;
  cityFilter: string;
  cityOptions: string[];
  statusOptions: StatusOption[];
  hasActiveFilters: boolean;
  shownCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCityFilterChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_180px_190px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="listing-search" className="sr-only">
            Search listings
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="listing-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by listing, seller, city, state, or status..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="listing-city-filter" className="sr-only">
            Filter by city
          </label>

          <select
            id="listing-city-filter"
            value={cityFilter}
            onChange={(event) => onCityFilterChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            <option value="all">All cities</option>

            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listing-status-filter" className="sr-only">
            Filter by status
          </label>

          <select
            id="listing-status-filter"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            <option value="all">All statuses</option>

            {statusOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
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
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{" "}
          <strong className="text-[var(--color-primary)]">{shownCount}</strong>{" "}
          of{" "}
          <strong className="text-[var(--color-primary)]">{totalCount}</strong>{" "}
          listings on this page.
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

export default AdminListingFilters;
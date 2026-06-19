import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  RefreshCcw,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useDeleteAdminListingMutation,
  useGetAdminListingsQuery,
  useGetPendingAdminListingsQuery,
  useRejectAdminListingMutation,
  useUpdateAdminListingStatusMutation,
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
import AdminListingCard from "./components/AdminListingCard";
import AdminListingFilters from "./components/AdminListingFilters";
import { ActionIconButton } from "./components/AdminListingActionButtons";

type ListingTab = "all" | "pending";

const LISTING_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Live", value: "live" },
  { label: "Rejected", value: "rejected" },
  { label: "Paused", value: "paused" },
  { label: "Under Contract", value: "under_contract" },
  { label: "Closed", value: "closed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Withdrawn", value: "withdrawn" },
];

function formatStatusLabel(status: string) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getListingStatus(listing: any, localStatuses: Record<string, string>) {
  const listingId = getMongoId(listing);

  return localStatuses[listingId] || listing.status || "unknown";
}

function isPendingListing(status: string) {
  const normalized = normalizeValue(status);

  return normalized === "submitted" || normalized === "pending";
}

function canMakeLive(status: string) {
  const normalized = normalizeValue(status);

  return !["live", "under_contract", "closed"].includes(normalized);
}

function canRejectListing(status: string) {
  const normalized = normalizeValue(status);

  return !["rejected", "under_contract", "closed", "cancelled"].includes(
    normalized
  );
}

function canDeleteListing(status: string) {
  const normalized = normalizeValue(status);

  return !["under_contract", "closed"].includes(normalized);
}

function getListingLocation(listing: any) {
  return (
    [listing.city, listing.state_code || listing.state]
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function AdminListingsPage() {
  const [tab, setTab] = useState<ListingTab>("all");
  const [page, setPage] = useState(1);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const [statusTarget, setStatusTarget] = useState<any | null>(null);
  const [statusValue, setStatusValue] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const [makeLiveTarget, setMakeLiveTarget] = useState<any | null>(null);
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [rejectReason, setRejectReason] = useState("");
  const [processingListingId, setProcessingListingId] = useState("");
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {}
  );

  const allListingsQuery = useGetAdminListingsQuery(
    { page, limit: 20 },
    { skip: tab !== "all" }
  );

  const pendingListingsQuery = useGetPendingAdminListingsQuery(
    { page, limit: 20 },
    { skip: tab !== "pending" }
  );

  const activeQuery = tab === "all" ? allListingsQuery : pendingListingsQuery;

  const [updateListingStatus, { isLoading: isStatusUpdating }] =
    useUpdateAdminListingStatusMutation();

  const [rejectListing, { isLoading: isRejecting }] =
    useRejectAdminListingMutation();

  const [deleteListing, { isLoading: isDeleting }] =
    useDeleteAdminListingMutation();

const rawListings = getApiList(activeQuery.data) as any[];

const tabListings: any[] =
  tab === "pending"
    ? rawListings.filter((listing: any) =>
        isPendingListing(getListingStatus(listing, localStatuses))
      )
    : rawListings;

const cityOptions = useMemo<string[]>(() => {
  const locations = tabListings
    .map((listing: any): string => getListingLocation(listing))
    .filter((location: string) => {
      return location.trim().length > 0 && location !== "-";
    });

  return Array.from(new Set(locations)).sort((a, b) =>
    a.localeCompare(b)
  );
}, [tabListings]);

  const hasActiveFilters =
    searchValue.trim().length > 0 ||
    statusFilter !== "all" ||
    cityFilter !== "all";

  const listings = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return tabListings.filter((listing: any) => {
      const status = getListingStatus(listing, localStatuses);
      const normalizedStatus = normalizeValue(status);
      const formattedStatus = formatStatusLabel(status);
      const seller = getPersonName(listing.seller_id);
      const title = getListingTitle(listing);
      const location = getListingLocation(listing);

      const matchesSearch =
        !normalizedSearch ||
        [title, seller, location, formattedStatus]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const matchesCity = cityFilter === "all" || location === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [tabListings, localStatuses, searchValue, statusFilter, cityFilter]);

  const pagination = getApiPagination(activeQuery.data);
  const totalPages = pagination.totalPages || 1;

  function clearFilters() {
    setSearchValue("");
    setStatusFilter("all");
    setCityFilter("all");
  }

  function openStatusModal(listing: any) {
    const currentStatus = getListingStatus(listing, localStatuses);

    setStatusTarget(listing);
    setStatusValue(normalizeValue(currentStatus));
    setStatusReason("");
  }

  function openMakeLiveModal(listing: any) {
    setMakeLiveTarget(listing);
  }

  async function handleChangeStatus() {
    if (!statusTarget || !statusValue) return;

    const listingId = getMongoId(statusTarget);

    try {
      setProcessingListingId(listingId);

      await updateListingStatus({
        id: listingId,
        status: statusValue,
        reason: statusReason.trim() || undefined,
      }).unwrap();

      setLocalStatuses((current) => ({
        ...current,
        [listingId]: statusValue,
      }));

      setStatusTarget(null);
      setStatusValue("");
      setStatusReason("");

      activeQuery.refetch();
    } finally {
      setProcessingListingId("");
    }
  }

  async function handleMakeLive() {
    if (!makeLiveTarget) return;

    const listingId = getMongoId(makeLiveTarget);

    try {
      setProcessingListingId(listingId);

      await updateListingStatus({
        id: listingId,
        status: "live",
        reason: "Admin changed listing status to live.",
      }).unwrap();

      setLocalStatuses((current) => ({
        ...current,
        [listingId]: "live",
      }));

      setMakeLiveTarget(null);

      activeQuery.refetch();
    } finally {
      setProcessingListingId("");
    }
  }

  async function handleReject() {
    if (!rejectTarget || rejectReason.trim().length < 3) return;

    const listingId = getMongoId(rejectTarget);

    try {
      setProcessingListingId(listingId);

      await rejectListing({
        id: listingId,
        reason: rejectReason.trim(),
      }).unwrap();

      setLocalStatuses((current) => ({
        ...current,
        [listingId]: "rejected",
      }));

      setRejectTarget(null);
      setRejectReason("");

      activeQuery.refetch();
    } finally {
      setProcessingListingId("");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const listingId = getMongoId(deleteTarget);

    try {
      setProcessingListingId(listingId);

      await deleteListing(listingId).unwrap();

      setDeleteTarget(null);

      activeQuery.refetch();
    } finally {
      setProcessingListingId("");
    }
  }

  const statusTargetId = statusTarget ? getMongoId(statusTarget) : "";
  const makeLiveTargetId = makeLiveTarget ? getMongoId(makeLiveTarget) : "";
  const rejectTargetId = rejectTarget ? getMongoId(rejectTarget) : "";
  const deleteTargetId = deleteTarget ? getMongoId(deleteTarget) : "";

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Listings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review submitted properties, manage listing status, and take
              approval actions without leaving this page.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Listing filters"
            className="grid grid-cols-2 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-1 sm:flex"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              aria-pressed={tab === "all"}
              onClick={() => {
                setTab("all");
                setPage(1);
              }}
              className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition-all duration-200 ${
                tab === "all"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-primary)]"
              }`}
            >
              All
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tab === "pending"}
              aria-pressed={tab === "pending"}
              onClick={() => {
                setTab("pending");
                setPage(1);
              }}
              className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition-all duration-200 ${
                tab === "pending"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-primary)]"
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </section>

      {!activeQuery.isLoading && !activeQuery.isError && tabListings.length > 0 && (
        <AdminListingFilters
          searchValue={searchValue}
          statusFilter={statusFilter}
          cityFilter={cityFilter}
          cityOptions={cityOptions}
          statusOptions={LISTING_STATUS_OPTIONS}
          hasActiveFilters={hasActiveFilters}
          shownCount={listings.length}
          totalCount={tabListings.length}
          onSearchChange={setSearchValue}
          onStatusFilterChange={setStatusFilter}
          onCityFilterChange={setCityFilter}
          onClear={clearFilters}
        />
      )}

      {activeQuery.isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading listings..." />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load listings
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading the admin listings.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => activeQuery.refetch()}
              className="justify-center"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No listings found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No listings match your current search or filter selection."
              : tab === "pending"
              ? "There are no pending listings waiting for review right now."
              : "There are no listings available in this view right now."}
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
          {/* Cards used below 2xl to avoid horizontal scroll in admin sidebar layout */}
          <div className="grid grid-cols-1 gap-4 2xl:hidden">
            {listings.map((listing: any) => {
              const listingId = getMongoId(listing);
              const status = getListingStatus(listing, localStatuses);

              return (
                <AdminListingCard
                  key={listingId}
                  listing={listing}
                  status={status}
                  location={getListingLocation(listing)}
                  formattedStatus={formatStatusLabel(status)}
                  isStatusUpdating={
                    isStatusUpdating && processingListingId === listingId
                  }
                  isRejecting={isRejecting && processingListingId === listingId}
                  isDeleting={isDeleting && processingListingId === listingId}
                  canMakeLive={canMakeLive}
                  canRejectListing={canRejectListing}
                  canDeleteListing={canDeleteListing}
                  onMakeLive={openMakeLiveModal}
                  onChangeStatus={openStatusModal}
                  onReject={setRejectTarget}
                  onDelete={setDeleteTarget}
                />
              );
            })}
          </div>

          {/* Table only on very large screens. No overflow-x and no min-width. */}
          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Listing Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Use icon actions to update, approve, reject, or delete
                    listings.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {listings.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[30%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Listing
                  </th>

                  <th className="w-[20%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Seller
                  </th>

                  <th className="w-[17%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="w-[14%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Created
                  </th>

                  <th className="w-[19%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {listings.map((listing: any) => {
                  const listingId = getMongoId(listing);
                  const status = getListingStatus(listing, localStatuses);
                  const seller = listing.seller_id;

                  const isThisStatusUpdating =
                    isStatusUpdating && processingListingId === listingId;

                  const isThisRejecting =
                    isRejecting && processingListingId === listingId;

                  const isThisDeleting =
                    isDeleting && processingListingId === listingId;

                  const isBusy =
                    isThisStatusUpdating || isThisRejecting || isThisDeleting;

                  return (
                    <tr
                      key={listingId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/properties/${listingId}`}
                          state={{ listing }}
                          className="line-clamp-2 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {getListingTitle(listing)}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getListingLocation(listing)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        <span className="line-clamp-2">
                          {getPersonName(seller)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatStatusLabel(status)}
                          variant={getStatusVariant(status)}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        {formatDate(listing.createdAt)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <ActionIconButton
                            label="Update Status"
                            variant="status"
                            disabled={isBusy}
                            onClick={() => openStatusModal(listing)}
                            icon={
                              <RefreshCcw
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            }
                          />

                          {canMakeLive(status) && (
                            <ActionIconButton
                              label="Make Live"
                              variant="success"
                              isLoading={isThisStatusUpdating}
                              disabled={isBusy}
                              onClick={() => openMakeLiveModal(listing)}
                              icon={
                                <CheckCircle
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              }
                            />
                          )}

                          {canRejectListing(status) && (
                            <ActionIconButton
                              label="Reject"
                              variant="danger"
                              isLoading={isThisRejecting}
                              disabled={isBusy}
                              onClick={() => setRejectTarget(listing)}
                              icon={
                                <XCircle
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              }
                            />
                          )}

                          {canDeleteListing(status) && (
                            <ActionIconButton
                              label="Delete"
                              variant="neutral"
                              isLoading={isThisDeleting}
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(listing)}
                              icon={
                                <Trash2
                                  className="h-4 w-4"
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
        isOpen={Boolean(makeLiveTarget)}
        variant="success"
        title="Make listing live?"
        description={`This will change "${
          makeLiveTarget ? getListingTitle(makeLiveTarget) : "this listing"
        }" status to live.`}
        icon={<CheckCircle className="h-5 w-5" />}
        confirmLabel="Make Live"
        loadingLabel="Updating..."
        isLoading={isStatusUpdating && processingListingId === makeLiveTargetId}
        onCancel={() => setMakeLiveTarget(null)}
        onConfirm={handleMakeLive}
      />

      <ConfirmModal
        isOpen={Boolean(statusTarget)}
        variant="success"
        title="Change listing status?"
        description={`Select a new status for "${
          statusTarget ? getListingTitle(statusTarget) : "this listing"
        }".`}
        icon={<RefreshCcw className="h-5 w-5" />}
        confirmLabel="Update Status"
        loadingLabel="Updating..."
        isLoading={isStatusUpdating && processingListingId === statusTargetId}
        onCancel={() => {
          setStatusTarget(null);
          setStatusValue("");
          setStatusReason("");
        }}
        onConfirm={handleChangeStatus}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="listing-status"
              className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
            >
              New status
            </label>

            <select
              id="listing-status"
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
            >
              {LISTING_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="listing-status-reason"
              className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
            >
              Reason optional
            </label>

            <textarea
              id="listing-status-reason"
              value={statusReason}
              onChange={(event) => setStatusReason(event.target.value)}
              rows={4}
              placeholder="Optional reason for status change..."
              className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
            />
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(rejectTarget)}
        variant="danger"
        title="Reject listing?"
        description={`This will mark "${
          rejectTarget ? getListingTitle(rejectTarget) : "this listing"
        }" as rejected.`}
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject Listing"
        loadingLabel="Rejecting..."
        isLoading={isRejecting && processingListingId === rejectTargetId}
        onCancel={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        onConfirm={handleReject}
      >
        <div>
          <label
            htmlFor="listing-reject-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Rejection reason
          </label>

          <textarea
            id="listing-reject-reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            placeholder="Enter rejection reason..."
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />

          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Minimum 3 characters are required before rejection can be submitted.
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete listing?"
        description="This listing will be deleted or marked as deleted by admin."
        icon={<Trash2 className="h-5 w-5" />}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting && processingListingId === deleteTargetId}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminListingsPage;
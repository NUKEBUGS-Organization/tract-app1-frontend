import { useState } from "react";
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

// function formatStatusLabel(status: string) {
//   if (!status) return "Unknown";

//   return status
//     .split("_")
//     .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//     .join(" ");
// }

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

function ListingMobileCard({
  listing,
  status,
  isStatusUpdating,
  isRejecting,
  isDeleting,
  onMakeLive,
  onChangeStatus,
  onReject,
  onDelete,
}: {
  listing: any;
  status: string;
  isStatusUpdating: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  onMakeLive: (listing: any) => void;
  onChangeStatus: (listing: any) => void;
  onReject: (listing: any) => void;
  onDelete: (listing: any) => void;
}) {
  const listingId = getMongoId(listing);
  const seller = listing.seller_id;
  const isBusy = isStatusUpdating || isRejecting || isDeleting;

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/properties/${listingId}`}
            state={{ listing }}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getListingTitle(listing)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {getListingLocation(listing)}
          </p>
        </div>

        <StatusBadge label={status} variant={getStatusVariant(status)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getPersonName(seller)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(listing.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
       

        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => onChangeStatus(listing)}
          className="w-full justify-center px-4 py-2 text-xs"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Status
        </Button>

        {canMakeLive(status) && (
          <Button
            type="button"
            variant="primary"
            isLoading={isStatusUpdating}
            disabled={isBusy}
            onClick={() => onMakeLive(listing)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <CheckCircle className="h-4 w-4" />
            Make Live
          </Button>
        )}

        {canRejectListing(status) && (
          <Button
            type="button"
            variant="danger"
            isLoading={isRejecting}
            disabled={isBusy}
            onClick={() => onReject(listing)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        )}

        {canDeleteListing(status) && (
          <Button
            type="button"
            variant="outline"
            isLoading={isDeleting}
            disabled={isBusy}
            onClick={() => onDelete(listing)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminListingsPage() {
  const [tab, setTab] = useState<ListingTab>("all");
  const [page, setPage] = useState(1);

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

  const rawListings = getApiList(activeQuery.data);

  const listings =
    tab === "pending"
      ? rawListings.filter((listing: any) =>
          isPendingListing(getListingStatus(listing, localStatuses))
        )
      : rawListings;

  const pagination = getApiPagination(activeQuery.data);

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Listings
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Review seller listings, edit listings, change listing status, reject
            invalid listings, or delete listings.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-xl border border-[var(--color-border-light)] bg-white p-1 sm:flex">
          <button
            type="button"
            onClick={() => {
              setTab("all");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
              tab === "all"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("pending");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
              tab === "pending"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {activeQuery.isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading listings..." />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load listings.
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No listings found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {listings.map((listing: any) => {
              const listingId = getMongoId(listing);
              const status = getListingStatus(listing, localStatuses);

              return (
                <ListingMobileCard
                  key={listingId}
                  listing={listing}
                  status={status}
                  isStatusUpdating={
                    isStatusUpdating && processingListingId === listingId
                  }
                  isRejecting={isRejecting && processingListingId === listingId}
                  isDeleting={isDeleting && processingListingId === listingId}
                  onMakeLive={openMakeLiveModal}
                  onChangeStatus={openStatusModal}
                  onReject={setRejectTarget}
                  onDelete={setDeleteTarget}
                />
              );
            })}
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Listing", "Seller", "Status", "Created", "Action"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                        >
                          {heading}
                        </th>
                      )
                    )}
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
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/properties/${listingId}`}
                            state={{ listing }}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getListingTitle(listing)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {getListingLocation(listing)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(seller)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={status}
                            variant={getStatusVariant(status)}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDate(listing.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            

                            <Button
                              type="button"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => openStatusModal(listing)}
                              className="px-4 py-2 text-xs"
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                              Status
                            </Button>

                            {canMakeLive(status) && (
                              <Button
                                type="button"
                                variant="primary"
                                isLoading={isThisStatusUpdating}
                                disabled={isBusy}
                                onClick={() => openMakeLiveModal(listing)}
                                className="px-4 py-2 text-xs"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Make Live
                              </Button>
                            )}

                            {canRejectListing(status) && (
                              <Button
                                type="button"
                                variant="danger"
                                isLoading={isThisRejecting}
                                disabled={isBusy}
                                onClick={() => setRejectTarget(listing)}
                                className="px-4 py-2 text-xs"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            )}

                            {canDeleteListing(status) && (
                              <Button
                                type="button"
                                variant="outline"
                                isLoading={isThisDeleting}
                                disabled={isBusy}
                                onClick={() => setDeleteTarget(listing)}
                                className="px-4 py-2 text-xs"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Page {pagination.page} of {pagination.totalPages || 1}
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
            disabled={page >= pagination.totalPages}
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
          <select
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
          >
            {LISTING_STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>

          <textarea
            value={statusReason}
            onChange={(event) => setStatusReason(event.target.value)}
            rows={4}
            placeholder="Optional reason for status change..."
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
          />
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
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={4}
          placeholder="Enter rejection reason..."
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
        />
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
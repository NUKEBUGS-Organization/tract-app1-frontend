import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle, Trash2, XCircle } from "lucide-react";

import {
  useApproveAdminListingMutation,
  useDeleteAdminListingMutation,
  useGetAdminListingsQuery,
  useGetPendingAdminListingsQuery,
  useRejectAdminListingMutation,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  formatDate,
  getApiList,
  getApiPagination,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

function getListingId(listing: any) {
  return listing?._id || "";
}

function getListingAddress(listing: any) {
  return listing?.address || "Listing";
}

function getListingLocation(listing: any) {
  return [listing?.city, listing?.state_code].filter(Boolean).join(" ");
}

function getSellerName(listing: any) {
  return listing?.seller_id?.full_name || "-";
}

function getListingStatus(listing: any) {
  return listing?.status || "unknown";
}

function AdminListingsPage() {
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const allListingsQuery = useGetAdminListingsQuery(
    { page, limit: 20 },
    { skip: tab !== "all" }
  );

  const pendingListingsQuery = useGetPendingAdminListingsQuery(
    { page, limit: 20 },
    { skip: tab !== "pending" }
  );

  const activeQuery = tab === "all" ? allListingsQuery : pendingListingsQuery;

  const [approveListing, { isLoading: isApproving }] =
    useApproveAdminListingMutation();
  const [rejectListing, { isLoading: isRejecting }] =
    useRejectAdminListingMutation();
  const [deleteListing, { isLoading: isDeleting }] =
    useDeleteAdminListingMutation();

  const listings = getApiList(activeQuery.data);
  const pagination = getApiPagination(activeQuery.data);

  async function handleApprove(listingId: string) {
    await approveListing(listingId).unwrap();
  }

  async function handleReject() {
    if (!rejectTarget || rejectReason.trim().length < 3) return;

    await rejectListing({
      id: getListingId(rejectTarget),
      reason: rejectReason.trim(),
    }).unwrap();

    setRejectTarget(null);
    setRejectReason("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    await deleteListing(getListingId(deleteTarget)).unwrap();
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Listings
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Review seller listings, approve submitted listings, reject invalid
            listings, or delete listings.
          </p>
        </div>

        <div className="flex rounded-xl border border-[var(--color-border-light)] bg-white p-1">
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

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        {activeQuery.isLoading ? (
          <div className="p-8">
            <Loader label="Loading listings..." />
          </div>
        ) : activeQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-[var(--color-danger)]">
            Failed to load listings.
          </div>
        ) : listings.length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-text-muted)]">
            No listings found.
          </div>
        ) : (
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-[var(--color-bg-soft)]">
              <tr>
                {["Listing", "Seller", "Status", "Created", "Action"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {listings.map((listing: any) => {
                const listingId = getListingId(listing);
                const status = normalizeValue(getListingStatus(listing));

                return (
                  <tr
                    key={listingId}
                    className="border-t border-[var(--color-border-light)]"
                  >
                    <td className="px-6 py-5">
                      <Link
                        to={`/listings/${listingId}`}
                        className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                      >
                        {getListingAddress(listing)}
                      </Link>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {getListingLocation(listing)}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm font-bold">
                      {getSellerName(listing)}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        label={getListingStatus(listing)}
                        variant={getStatusVariant(status)}
                      />
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                      {formatDate(listing.createdAt)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {status === "submitted" && (
                          <>
                            <Button
                              type="button"
                              variant="primary"
                              isLoading={isApproving}
                              onClick={() => handleApprove(listingId)}
                              className="px-4 py-2 text-xs"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>

                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => setRejectTarget(listing)}
                              className="px-4 py-2 text-xs"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDeleteTarget(listing)}
                          className="px-4 py-2 text-xs"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(rejectTarget)}
        variant="danger"
        title="Reject listing?"
        description="This will mark the listing as rejected."
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject Listing"
        loadingLabel="Rejecting..."
        isLoading={isRejecting}
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
        description="This listing will be marked as deleted by admin."
        icon={<Trash2 className="h-5 w-5" />}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminListingsPage;

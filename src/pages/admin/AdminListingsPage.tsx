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
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

function ListingMobileCard({
  listing,
  isApproving,
  onApprove,
  onReject,
  onDelete,
}: {
  listing: any;
  isApproving: boolean;
  onApprove: (listingId: string) => void;
  onReject: (listing: any) => void;
  onDelete: (listing: any) => void;
}) {
  const listingId = getMongoId(listing);
  const status = normalizeValue(listing.status);
  const seller = listing.seller_id;

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/properties/${listingId}`}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getListingTitle(listing)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {[listing.city, listing.state_code].filter(Boolean).join(", ") ||
              "-"}
          </p>
        </div>

        <StatusBadge
          label={listing.status || "unknown"}
          variant={getStatusVariant(status)}
        />
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

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {status === "submitted" && (
          <>
            <Button
              type="button"
              variant="primary"
              isLoading={isApproving}
              onClick={() => onApprove(listingId)}
              className="w-full justify-center px-4 py-2 text-xs"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() => onReject(listing)}
              className="w-full justify-center px-4 py-2 text-xs"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => onDelete(listing)}
          className="w-full justify-center px-4 py-2 text-xs"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
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
      id: getMongoId(rejectTarget),
      reason: rejectReason.trim(),
    }).unwrap();

    setRejectTarget(null);
    setRejectReason("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    await deleteListing(getMongoId(deleteTarget)).unwrap();
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Listings
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Review seller listings, approve submitted listings, reject invalid
            listings, or delete listings.
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
          {/* Mobile / small screen cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {listings.map((listing: any) => (
              <ListingMobileCard
                key={getMongoId(listing)}
                listing={listing}
                isApproving={isApproving}
                onApprove={handleApprove}
                onReject={setRejectTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Desktop / tablet table with horizontal scroll */}
          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
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
                    const status = normalizeValue(listing.status);
                    const seller = listing.seller_id;

                    return (
                      <tr
                        key={listingId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/properties/${listingId}`}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getListingTitle(listing)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {[listing.city, listing.state_code]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(seller)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={listing.status || "unknown"}
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
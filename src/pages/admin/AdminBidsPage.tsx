import { useState } from "react";
import { Link } from "react-router";

import { useGetAdminBidsQuery } from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  formatDate,
  formatMoney,
  getApiList,
  getApiPagination,
  getBidAmount,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../utils/adminUtils";

function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";

  return value.email || value._doc?.email || "-";
}

function AdminBidMobileCard({ bid }: { bid: any }) {
  const bidId = getMongoId(bid);
  const bidAmount = getBidAmount(bid);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/bids/${bidId}`}
            state={{ bid }}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getPersonName(bid.bidder_id)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {getRelationEmail(bid.bidder_id)}
          </p>
        </div>

        <StatusBadge
          label={bid.status || "unknown"}
          variant={getStatusVariant(bid.status)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Property
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getListingTitle(bid.property_id)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Amount
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {formatMoney(bidAmount)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(bid.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/bids/${bidId}`}
          state={{ bid }}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function AdminBidsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminBidsQuery({
    page,
    limit: 20,
  });

  const bids = getApiList(data);
  const pagination = getApiPagination(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Bids
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          View all bids placed on seller listings.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading bids..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load bids.
        </div>
      ) : bids.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No bids found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {bids.map((bid: any) => (
              <AdminBidMobileCard key={getMongoId(bid)} bid={bid} />
            ))}
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "Bidder",
                      "Property",
                      "Amount",
                      "Status",
                      "Created",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {bids.map((bid: any) => {
                    const bidId = getMongoId(bid);
                    const bidAmount = getBidAmount(bid);

                    return (
                      <tr
                        key={bidId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/bids/${bidId}`}
                            state={{ bid }}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getPersonName(bid.bidder_id)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {getRelationEmail(bid.bidder_id)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/bids/${bidId}`}
                            state={{ bid }}
                            className="text-sm font-bold text-[var(--color-text-main)] hover:text-[var(--color-secondary)]"
                          >
                            {getListingTitle(bid.property_id)}
                          </Link>
                        </td>

                        <td className="px-6 py-5 text-sm font-black text-[var(--color-primary)]">
                          {formatMoney(bidAmount)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={bid.status || "unknown"}
                            variant={getStatusVariant(bid.status)}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDate(bid.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/bids/${bidId}`}
                            state={{ bid }}
                            className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                          >
                            View Details
                          </Link>
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
    </div>
  );
}

export default AdminBidsPage;
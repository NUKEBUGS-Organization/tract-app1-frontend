
// src/pages/admin/AdminBidsPage.tsx

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

function getBidderName(bid: any) {
  return bid?.bidder_id?.full_name || "-";
}

function getBidderEmail(bid: any) {
  return bid?.bidder_id?.email || "-";
}

function getPropertyAddress(bid: any) {
  return bid?.property_id?.address || "-";
}

function getBidPrice(bid: any) {
  return bid?.bid_price ?? null;
}

function AdminBidMobileCard({ bid }: { bid: any }) {
  const bidId = getMongoId(bid);
  const bidAmount = getBidPrice(bid);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/bids/${bidId}`}
            state={{ bid }}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getBidderName(bid)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {getBidderEmail(bid)}
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
            {getPropertyAddress(bid)}
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
  const [filter, setFilter] = useState<BidFilter>("all");

  const { data, isLoading, isError } = useGetAdminBidsQuery({
    page,
    limit: 20,
  });

  const allBids = getApiList(data);

  const bids =
    filter === "all"
      ? allBids
      : allBids.filter(
          (bid: any) => normalizeValue(bid.status) === filter
        );

  const pagination = getApiPagination(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Bids
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            View and filter all bids placed on seller listings.
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="flex min-w-max rounded-xl border border-[var(--color-border-light)] bg-white p-1">
            {BID_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                  filter === option.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
          {filter === "all"
            ? "No bids found."
            : `No ${filter.replace("_", " ")} bids found.`}
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
                    const bidAmount = getBidPrice(bid);

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
                            {getBidderName(bid)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {getBidderEmail(bid)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/bids/${bidId}`}
                            state={{ bid }}
                            className="text-sm font-bold text-[var(--color-text-main)] hover:text-[var(--color-secondary)]"
                          >
                            {getPropertyAddress(bid)}
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
            disabled={page >= (pagination.totalPages || 1)}
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
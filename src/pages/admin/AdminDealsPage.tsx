import { useState } from "react";
import { Link } from "react-router";
import { LockKeyhole } from "lucide-react";

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

function getDealProperty(deal: any) {
  return deal?.listing_id ?? deal?.property_id ?? null;
}

function AdminDealMobileCard({
  deal,
  isClosing,
  onClose,
}: {
  deal: any;
  isClosing: boolean;
  onClose: (deal: any) => void;
}) {
  const dealId = getMongoId(deal);
  const status = normalizeValue(deal.status);
  const property = getDealProperty(deal);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/deals/${dealId}`}
            state={{ deal }}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getListingTitle(property)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {dealId}
          </p>
        </div>

        <StatusBadge
          label={deal.status || "unknown"}
          variant={getStatusVariant(status)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getPersonName(deal.seller_id)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Buyer
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getPersonName(deal.buyer_id)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(deal.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          to={`/deals/${dealId}`}
          state={{ deal }}
          className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          View Details
        </Link>

        {status !== "closed" && (
          <Button
            type="button"
            variant="danger"
            isLoading={isClosing}
            onClick={() => onClose(deal)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <LockKeyhole className="h-4 w-4" />
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminDealsPage() {
  const [page, setPage] = useState(1);
  const [closeTarget, setCloseTarget] = useState<any | null>(null);

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

  const deals = getApiList(data);
  const pagination = getApiPagination(data);

  async function handleCloseDeal() {
    if (!closeTarget) return;

    await closeDeal(getMongoId(closeTarget)).unwrap();

    setCloseTarget(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Deals
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Monitor all platform deals and force close deals when needed.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading deals..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load deals.
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No deals found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {deals.map((deal: any) => (
              <AdminDealMobileCard
                key={getMongoId(deal)}
                deal={deal}
                isClosing={isClosing}
                onClose={setCloseTarget}
              />
            ))}
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "Deal",
                      "Seller",
                      "Buyer",
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
                  {deals.map((deal: any) => {
                    const dealId = getMongoId(deal);
                    const status = normalizeValue(deal.status);
                    const property = getDealProperty(deal);

                    return (
                      <tr
                        key={dealId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/deals/${dealId}`}
                            state={{ deal }}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getListingTitle(property)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {dealId}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(deal.seller_id)}
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(deal.buyer_id)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={deal.status || "unknown"}
                            variant={getStatusVariant(status)}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDate(deal.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-3">
                            <Link
                              to={`/deals/${dealId}`}
                              state={{ deal }}
                              className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                            >
                              View Details
                            </Link>

                            {status !== "closed" && (
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => setCloseTarget(deal)}
                                className="px-4 py-2 text-xs"
                              >
                                <LockKeyhole className="h-4 w-4" />
                                Close
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
        isOpen={Boolean(closeTarget)}
        variant="danger"
        title="Force close deal?"
        description="This will close the deal from admin side."
        icon={<LockKeyhole className="h-5 w-5" />}
        confirmLabel="Close Deal"
        loadingLabel="Closing..."
        isLoading={isClosing}
        onCancel={() => setCloseTarget(null)}
        onConfirm={handleCloseDeal}
      />
    </div>
  );
}

export default AdminDealsPage;
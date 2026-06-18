
import { useState } from "react";
import { Link } from "react-router";

import { useGetAdminContractsQuery } from "../../services/adminService";

import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  formatDate,
  getApiList,
  getApiPagination,
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

function getContractId(contract: any) {
  return contract?._id || "";
}

function getContractPropertyName(contract: any) {
  return contract?.property_id?.address || "Listing";
}

function getContractSellerName(contract: any) {
  return contract?.seller_id?.full_name || "-";
}

function getContractBuyerName(contract: any) {
  return contract?.buyer_id?.full_name || "-";
}

function AdminContractMobileCard({ contract }: { contract: any }) {
  const contractId = getContractId(contract);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/contracts/${contractId}`}
            state={{ contract }}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getContractPropertyName(contract)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {contractId}
          </p>
        </div>

        <StatusBadge
          label={contract.status || "unknown"}
          variant={getStatusVariant(contract.status)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getContractSellerName(contract)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Buyer
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getContractBuyerName(contract)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(contract.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/contracts/${contractId}`}
          state={{ contract }}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ContractFilter>("all");

  const { data, isLoading, isError } = useGetAdminContractsQuery({
    page,
    limit: 20,
  });

  const allContracts = getApiList(data);

  const availableStatuses = Array.from(
    new Set(
      allContracts
        .map((contract: any) => normalizeValue(contract.status))
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

  const contracts =
    filter === "all"
      ? allContracts
      : allContracts.filter(
          (contract: any) => normalizeValue(contract.status) === filter
        );

  const pagination = getApiPagination(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Contracts
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            View and filter all generated contracts and signing statuses.
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="flex min-w-max rounded-xl border border-[var(--color-border-light)] bg-white p-1">
            {contractFilters.map((option) => (
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
          <Loader label="Loading contracts..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load contracts.
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          {filter === "all"
            ? "No contracts found."
            : `No ${formatStatusLabel(filter).toLowerCase()} contracts found.`}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {contracts.map((contract: any) => (
              <AdminContractMobileCard
                key={getContractId(contract)}
                contract={contract}
              />
            ))}
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "Property",
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
                  {contracts.map((contract: any) => {
                    const contractId = getContractId(contract);

                    return (
                      <tr
                        key={contractId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/contracts/${contractId}`}
                            state={{ contract }}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getContractPropertyName(contract)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {contractId}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getContractSellerName(contract)}
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getContractBuyerName(contract)}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={contract.status || "unknown"}
                            variant={getStatusVariant(contract.status)}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDate(contract.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/contracts/${contractId}`}
                            state={{ contract }}
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

export default AdminContractsPage;

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle,
  FilterX,
  RefreshCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useApproveKycUserMutation,
  useGetAdminUsersQuery,
  useGetPendingKycUsersQuery,
  useRejectKycUserMutation,
} from "../../services/adminService";

import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  getApiList,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

type VerificationFilter = "pending" | "all";

function formatStatusLabel(status: string) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRoleLabel(role: string) {
  if (!role) return "-";

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getUserKycStatus(user: any, localStatuses: Record<string, string>) {
  const userId = getMongoId(user);

  return localStatuses[userId] || user.kyc_status || "pending";
}

function getUserEmail(user: any) {
  return user?.email || "-";
}

function getUserRole(user: any) {
  return user?.role || "-";
}

function isPendingKyc(status: string) {
  const normalized = normalizeValue(status);

  return ["pending", "submitted", "in_review", "under_review"].includes(
    normalized
  );
}

function isApprovedKyc(status: string) {
  return normalizeValue(status) === "approved";
}

function isRejectedKyc(status: string) {
  return normalizeValue(status) === "rejected";
}

function isAdminUser(user: any) {
  return normalizeValue(user?.role) === "admin";
}

function getKycCounts(users: any[], localStatuses: Record<string, string>) {
  return users.reduce(
    (counts, user) => {
      const status = getUserKycStatus(user, localStatuses);

      if (isPendingKyc(status)) counts.pending += 1;
      if (isApprovedKyc(status)) counts.approved += 1;
      if (isRejectedKyc(status)) counts.rejected += 1;

      return counts;
    },
    {
      pending: 0,
      approved: 0,
      rejected: 0,
    }
  );
}


function ActionIconButton({
  label,
  icon,
  variant,
  isLoading,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant: "success" | "danger";
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const variantClasses =
    variant === "danger"
      ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
      : "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses}`}
    >
      {isLoading ? (
        <RefreshCcw className="h-4 w-4 shrink-0 animate-spin" />
      ) : (
        icon
      )}

      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  );
}

function AdminVerificationFilters({
  searchValue,
  filter,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onClear,
}: {
  searchValue: string;
  filter: VerificationFilter;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: VerificationFilter) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="verification-search" className="sr-only">
            Search verification users
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="verification-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, role, or KYC status..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="verification-filter" className="sr-only">
            Filter verification users
          </label>

          <select
            id="verification-filter"
            value={filter}
            onChange={(event) =>
              onFilterChange(event.target.value as VerificationFilter)
            }
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            <option value="pending">Pending users</option>
            <option value="all">All users</option>
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
          users in this view.
        </span>

        {hasActiveFilters && (
          <span className="text-[var(--color-primary)]">
            Search is applied to the current loaded view.
          </span>
        )}
      </div>
    </section>
  );
}

function VerificationCard({
  user,
  status,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: {
  user: any;
  status: string;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: (user: any) => void;
  onReject: (user: any) => void;
}) {
  const canTakeAction = isPendingKyc(status);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-base font-black leading-6 text-[var(--color-primary)]">
            {getPersonName(user)}
          </p>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {getUserEmail(user)}
          </p>
        </div>

        <StatusBadge
          label={formatStatusLabel(status)}
          variant={getStatusVariant(status)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Role
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {formatRoleLabel(getUserRole(user))}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Action State
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {canTakeAction ? "Review needed" : "No action needed"}
          </p>
        </div>
      </div>

      {canTakeAction && (
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary"
            isLoading={isApproving}
            disabled={isApproving || isRejecting}
            onClick={() => onApprove(user)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isRejecting}
            disabled={isApproving || isRejecting}
            onClick={() => onReject(user)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}
    </article>
  );
}

function AdminVerificationPage() {
  const [filter, setFilter] = useState<VerificationFilter>("pending");
  const [searchValue, setSearchValue] = useState("");

  const [approveTarget, setApproveTarget] = useState<any | null>(null);
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [processingUserId, setProcessingUserId] = useState("");
  const [localKycStatuses, setLocalKycStatuses] = useState<
    Record<string, string>
  >({});

  const pendingQuery = useGetPendingKycUsersQuery(undefined, {
    skip: filter !== "pending",
  });

  const allUsersQuery = useGetAdminUsersQuery(
    {
      page: 1,
      limit: 500,
    },
    {
      skip: filter !== "all",
    }
  );

  const activeQuery = filter === "pending" ? pendingQuery : allUsersQuery;

  const [approveKyc, { isLoading: isApproving }] = useApproveKycUserMutation();
  const [rejectKyc, { isLoading: isRejecting }] = useRejectKycUserMutation();

  const rawUsers = getApiList(activeQuery.data) as any[];

  const viewUsers = rawUsers
    .filter((user: any) => !isAdminUser(user))
    .filter((user: any) => {
      if (filter !== "pending") return true;

      return isPendingKyc(getUserKycStatus(user, localKycStatuses));
    });

  const users = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return viewUsers;

    return viewUsers.filter((user: any) => {
      const status = getUserKycStatus(user, localKycStatuses);

      const searchText = [
        getPersonName(user),
        getUserEmail(user),
        getUserRole(user),
        formatStatusLabel(status),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [viewUsers, searchValue, localKycStatuses]);

  const counts = getKycCounts(viewUsers, localKycStatuses);
  const pendingUsersCount = counts.pending;
  const hasActiveFilters =
    searchValue.trim().length > 0 || filter !== "pending";

  function clearFilters() {
    setSearchValue("");
    setFilter("pending");
  }

  async function handleApprove() {
    if (!approveTarget) return;

    const userId = getMongoId(approveTarget);

    try {
      setProcessingUserId(userId);

      await approveKyc(userId).unwrap();

      setLocalKycStatuses((current) => ({
        ...current,
        [userId]: "approved",
      }));

      setApproveTarget(null);
      activeQuery.refetch();
    } finally {
      setProcessingUserId("");
    }
  }

  async function handleReject() {
    if (!rejectTarget || rejectReason.trim().length < 3) return;

    const userId = getMongoId(rejectTarget);

    try {
      setProcessingUserId(userId);

      await rejectKyc({
        id: userId,
        reason: rejectReason.trim(),
      }).unwrap();

      setLocalKycStatuses((current) => ({
        ...current,
        [userId]: "rejected",
      }));

      setRejectTarget(null);
      setRejectReason("");
      activeQuery.refetch();
    } finally {
      setProcessingUserId("");
    }
  }

  const approveTargetId = approveTarget ? getMongoId(approveTarget) : "";
  const rejectTargetId = rejectTarget ? getMongoId(rejectTarget) : "";

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Verification Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Verification Queue
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review user KYC submissions, approve verified users, or reject
              incomplete applications with a clear reason.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Pending Users
            </p>

            <p className="mt-1 font-serif text-2xl font-black leading-none text-[var(--color-primary)]">
              {pendingUsersCount}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
              Waiting for KYC review
            </p>
          </div>
        </div>
      </section>

      {!activeQuery.isLoading && !activeQuery.isError && viewUsers.length > 0 && (
        <AdminVerificationFilters
          searchValue={searchValue}
          filter={filter}
          shownCount={users.length}
          totalCount={viewUsers.length}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchValue}
          onFilterChange={(value) => {
            setFilter(value);
            setSearchValue("");
          }}
          onClear={clearFilters}
        />
      )}

      {activeQuery.isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading verification queue..." />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load verification queue
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading KYC users.
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
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No verification users found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No users match your current search or filter selection."
              : filter === "pending"
                ? "There are no pending KYC users right now."
                : "No users were found."}
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
            {users.map((user: any) => {
              const userId = getMongoId(user);
              const status = getUserKycStatus(user, localKycStatuses);

              return (
                <VerificationCard
                  key={userId}
                  user={user}
                  status={status}
                  isApproving={isApproving && processingUserId === userId}
                  isRejecting={isRejecting && processingUserId === userId}
                  onApprove={setApproveTarget}
                  onReject={setRejectTarget}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Verification Users
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Review user identity status and take approval action.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {users.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[34%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    User
                  </th>

                  <th className="w-[20%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Role
                  </th>

                  <th className="w-[22%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    KYC Status
                  </th>

                  <th className="w-[24%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user: any) => {
                  const userId = getMongoId(user);
                  const status = getUserKycStatus(user, localKycStatuses);
                  const canTakeAction = isPendingKyc(status);

                  const isThisApproving =
                    isApproving && processingUserId === userId;

                  const isThisRejecting =
                    isRejecting && processingUserId === userId;

                  return (
                    <tr
                      key={userId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 font-black text-[var(--color-primary)]">
                          {getPersonName(user)}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getUserEmail(user)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {formatRoleLabel(getUserRole(user))}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatStatusLabel(status)}
                          variant={getStatusVariant(status)}
                        />
                      </td>

                      <td className="px-6 py-5">
                        {canTakeAction ? (
                          <div className="flex min-w-[92px] items-center justify-center gap-2">
                            <ActionIconButton
                              label="Approve KYC"
                              variant="success"
                              isLoading={isThisApproving}
                              disabled={isThisApproving || isThisRejecting}
                              onClick={() => setApproveTarget(user)}
                              icon={
                                <CheckCircle
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              }
                            />

                            <ActionIconButton
                              label="Reject KYC"
                              variant="danger"
                              isLoading={isThisRejecting}
                              disabled={isThisApproving || isThisRejecting}
                              onClick={() => setRejectTarget(user)}
                              icon={
                                <XCircle
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              }
                            />
                          </div>
                        ) : (
                          <p className="text-center text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                            No action
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(approveTarget)}
        variant="success"
        title="Approve KYC?"
        description={`Are you sure you want to approve KYC for ${approveTarget ? getPersonName(approveTarget) : "this user"
          }?`}
        icon={<CheckCircle className="h-5 w-5" />}
        confirmLabel="Approve KYC"
        loadingLabel="Approving..."
        isLoading={isApproving && processingUserId === approveTargetId}
        onCancel={() => setApproveTarget(null)}
        onConfirm={handleApprove}
      />

      <ConfirmModal
        isOpen={Boolean(rejectTarget)}
        variant="danger"
        title="Reject KYC?"
        description={`This will mark ${rejectTarget ? getPersonName(rejectTarget) : "this user"
          }'s KYC as rejected.`}
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject KYC"
        loadingLabel="Rejecting..."
        isLoading={isRejecting && processingUserId === rejectTargetId}
        onCancel={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        onConfirm={handleReject}
      >
        <div>
          <label
            htmlFor="kyc-reject-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Rejection reason
          </label>

          <textarea
            id="kyc-reject-reason"
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
    </div>
  );
}

export default AdminVerificationPage;
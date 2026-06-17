import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

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

function getUserKycStatus(user: any, localStatuses: Record<string, string>) {
  const userId = getMongoId(user);

  return localStatuses[userId] || user.kyc_status || "pending";
}

function isPendingKyc(status: string) {
  return normalizeValue(status) === "pending";
}

function isAdminUser(user: any) {
  return normalizeValue(user?.role) === "admin";
}

function VerificationMobileCard({
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
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words font-black text-[var(--color-primary)]">
            {getPersonName(user)}
          </p>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {user.email || "-"}
          </p>
        </div>

        <StatusBadge label={status} variant={getStatusVariant(status)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Role
          </p>

          <p className="mt-1 text-sm font-bold capitalize text-[var(--color-text-main)]">
            {user.role || "-"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            KYC Status
          </p>

          <div className="mt-2">
            <StatusBadge label={status} variant={getStatusVariant(status)} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="primary"
          isLoading={isApproving}
          disabled={!canTakeAction || isApproving || isRejecting}
          onClick={() => onApprove(user)}
          className="w-full justify-center px-4 py-2 text-xs"
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>

        <Button
          type="button"
          variant="danger"
          isLoading={isRejecting}
          disabled={!canTakeAction || isApproving || isRejecting}
          onClick={() => onReject(user)}
          className="w-full justify-center px-4 py-2 text-xs"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

function AdminVerificationPage() {
  const [filter, setFilter] = useState<VerificationFilter>("pending");

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

  const rawUsers = getApiList(activeQuery.data);

  const users = rawUsers
    .filter((user: any) => !isAdminUser(user))
    .filter((user: any) => {
      if (filter !== "pending") return true;

      return isPendingKyc(getUserKycStatus(user, localKycStatuses));
    });

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Verification Queue
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Review KYC users and approve or reject verification.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-xl border border-[var(--color-border-light)] bg-white p-1 sm:flex">
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
              filter === "pending"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Pending
          </button>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
              filter === "all"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {activeQuery.isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading verification queue..." />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load verification queue.
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          {filter === "pending"
            ? "No pending KYC users."
            : "No users found."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {users.map((user: any) => {
              const userId = getMongoId(user);
              const status = getUserKycStatus(user, localKycStatuses);

              return (
                <VerificationMobileCard
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

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["User", "Role", "KYC Status", "Action"].map(
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
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-[var(--color-primary)]">
                            {getPersonName(user)}
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {user.email || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold capitalize">
                          {user.role || "-"}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={status}
                            variant={getStatusVariant(status)}
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              isLoading={isThisApproving}
                              disabled={
                                !canTakeAction ||
                                isThisApproving ||
                                isThisRejecting
                              }
                              onClick={() => setApproveTarget(user)}
                              className="px-4 py-2 text-xs"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>

                            <Button
                              type="button"
                              variant="danger"
                              isLoading={isThisRejecting}
                              disabled={
                                !canTakeAction ||
                                isThisApproving ||
                                isThisRejecting
                              }
                              onClick={() => setRejectTarget(user)}
                              className="px-4 py-2 text-xs"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
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

      <ConfirmModal
        isOpen={Boolean(approveTarget)}
        variant="success"
        title="Approve KYC?"
        description={`Are you sure you want to approve KYC for ${
          approveTarget ? getPersonName(approveTarget) : "this user"
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
        description={`This will mark ${
          rejectTarget ? getPersonName(rejectTarget) : "this user"
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
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={4}
          placeholder="Enter rejection reason..."
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
        />
      </ConfirmModal>
    </div>
  );
}

export default AdminVerificationPage;
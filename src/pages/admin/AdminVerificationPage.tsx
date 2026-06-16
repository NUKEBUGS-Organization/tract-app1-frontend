import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import {
  useApproveKycUserMutation,
  useGetPendingKycUsersQuery,
  useRejectKycUserMutation,
} from "../../services/adminService";

import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getApiList, getMongoId, getPersonName } from "../../utils/adminUtils";

function VerificationMobileCard({
  user,
  isApproving,
  onApprove,
  onReject,
}: {
  user: any;
  isApproving: boolean;
  onApprove: (userId: string) => void;
  onReject: (user: any) => void;
}) {
  const userId = getMongoId(user);

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

        <StatusBadge label={user.kyc_status || "pending"} variant="warning" />
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
            <StatusBadge
              label={user.kyc_status || "pending"}
              variant="warning"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="primary"
          isLoading={isApproving}
          onClick={() => onApprove(userId)}
          className="w-full justify-center px-4 py-2 text-xs"
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>

        <Button
          type="button"
          variant="danger"
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
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = useGetPendingKycUsersQuery();

  const [approveKyc, { isLoading: isApproving }] = useApproveKycUserMutation();
  const [rejectKyc, { isLoading: isRejecting }] = useRejectKycUserMutation();

  const users = getApiList(data);

  async function handleApprove(userId: string) {
    await approveKyc(userId).unwrap();
  }

  async function handleReject() {
    if (!rejectTarget || rejectReason.trim().length < 3) return;

    await rejectKyc({
      id: getMongoId(rejectTarget),
      reason: rejectReason.trim(),
    }).unwrap();

    setRejectTarget(null);
    setRejectReason("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Verification Queue
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Review pending KYC users and approve or reject verification.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading verification queue..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load verification queue.
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No pending KYC users.
        </div>
      ) : (
        <>
          {/* Mobile / small screen cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {users.map((user: any) => (
              <VerificationMobileCard
                key={getMongoId(user)}
                user={user}
                isApproving={isApproving}
                onApprove={handleApprove}
                onReject={setRejectTarget}
              />
            ))}
          </div>

          {/* Desktop / tablet table with horizontal scroll */}
          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
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
                            label={user.kyc_status || "pending"}
                            variant="warning"
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              isLoading={isApproving}
                              onClick={() => handleApprove(userId)}
                              className="px-4 py-2 text-xs"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>

                            <Button
                              type="button"
                              variant="danger"
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
        isOpen={Boolean(rejectTarget)}
        variant="danger"
        title="Reject KYC?"
        description="This will mark the user's KYC as rejected."
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject KYC"
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
    </div>
  );
}

export default AdminVerificationPage;
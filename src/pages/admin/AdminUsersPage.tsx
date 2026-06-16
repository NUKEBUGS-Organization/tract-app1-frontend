import { useState } from "react";
import { Link } from "react-router";
import { Ban, RotateCcw } from "lucide-react";

import {
  useBanAdminUserMutation,
  useGetAdminUsersQuery,
  useUnbanAdminUserMutation,
} from "../../services/adminService";

import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  formatDate,
  getApiList,
  getApiPagination,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

function UserMobileCard({
  user,
  isUnbanning,
  onBan,
  onUnban,
}: {
  user: any;
  isUnbanning: boolean;
  onBan: (user: any) => void;
  onUnban: (userId: string) => void;
}) {
  const userId = getMongoId(user);
  const kycStatus = normalizeValue(user.kyc_status);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/users/${userId}`}
            className="break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {getPersonName(user)}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {user.email || "-"}
          </p>
        </div>

        <StatusBadge
          label={user.is_banned ? "Banned" : "Active"}
          variant={user.is_banned ? "danger" : "success"}
        />
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
            KYC
          </p>
          <div className="mt-2">
            <StatusBadge
              label={user.kyc_status || "unknown"}
              variant={getStatusVariant(kycStatus)}
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Joined
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {user.is_banned ? (
          <Button
            type="button"
            variant="outline"
            isLoading={isUnbanning}
            onClick={() => onUnban(userId)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Unban
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={() => onBan(user)}
            className="w-full justify-center px-4 py-2 text-xs"
          >
            <Ban className="h-4 w-4" />
            Ban
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminUsersPage() {
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");

  const { data, isLoading, isError } = useGetAdminUsersQuery({
    role: role || undefined,
    page,
    limit: 20,
  });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  const users = getApiList(data);
  const pagination = getApiPagination(data);

  async function handleBan() {
    if (!banTarget || banReason.trim().length < 3) return;

    await banUser({
      id: getMongoId(banTarget),
      reason: banReason.trim(),
    }).unwrap();

    setBanTarget(null);
    setBanReason("");
  }

  async function handleUnban(userId: string) {
    await unbanUser(userId).unwrap();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            Users
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            View platform users, filter by role, and ban or unban accounts.
          </p>
        </div>

        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold outline-none lg:w-64"
        >
          <option value="">All Roles</option>
          <option value="seller">Seller</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="realtor">Realtor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading users..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load users.
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No users found.
        </div>
      ) : (
        <>
          {/* Mobile / small screen cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {users.map((user: any) => (
              <UserMobileCard
                key={getMongoId(user)}
                user={user}
                isUnbanning={isUnbanning}
                onBan={setBanTarget}
                onUnban={handleUnban}
              />
            ))}
          </div>

          {/* Desktop table with horizontal scroll */}
          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "User",
                      "Role",
                      "KYC",
                      "Ban Status",
                      "Joined",
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
                  {users.map((user: any) => {
                    const userId = getMongoId(user);
                    const kycStatus = normalizeValue(user.kyc_status);

                    return (
                      <tr
                        key={userId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/users/${userId}`}
                            className="font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                          >
                            {getPersonName(user)}
                          </Link>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {user.email || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold capitalize">
                          {user.role || "-"}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={user.kyc_status || "unknown"}
                            variant={getStatusVariant(kycStatus)}
                          />
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            label={user.is_banned ? "Banned" : "Active"}
                            variant={user.is_banned ? "danger" : "success"}
                          />
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          {user.is_banned ? (
                            <Button
                              type="button"
                              variant="outline"
                              isLoading={isUnbanning}
                              onClick={() => handleUnban(userId)}
                              className="px-4 py-2 text-xs"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => setBanTarget(user)}
                              className="px-4 py-2 text-xs"
                            >
                              <Ban className="h-4 w-4" />
                              Ban
                            </Button>
                          )}
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
        isOpen={Boolean(banTarget)}
        variant="danger"
        title="Ban user?"
        description="This user will be blocked from platform access until admin removes the ban."
        icon={<Ban className="h-5 w-5" />}
        confirmLabel="Ban User"
        loadingLabel="Banning..."
        isLoading={isBanning}
        onCancel={() => {
          setBanTarget(null);
          setBanReason("");
        }}
        onConfirm={handleBan}
      >
        <textarea
          value={banReason}
          onChange={(event) => setBanReason(event.target.value)}
          rows={4}
          placeholder="Enter ban reason..."
          className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-secondary)]"
        />
      </ConfirmModal>
    </div>
  );
}

export default AdminUsersPage;
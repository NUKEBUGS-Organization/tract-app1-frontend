import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Ban,
  Eye,
  FilterX,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
  XCircle,
} from "lucide-react";

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

type RoleFilter = "" | "seller" | "wholesaler" | "realtor";

type RoleOption = {
  label: string;
  value: RoleFilter;
};

const ROLE_OPTIONS: RoleOption[] = [
  { label: "All Roles", value: "" },
  { label: "Seller", value: "seller" },
  { label: "Wholesaler", value: "wholesaler" },
  { label: "Realtor", value: "realtor" },
];

function formatLabel(value: string) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getUserEmail(user: any) {
  return user?.email || "-";
}

function getUserRole(user: any) {
  return user?.role || "-";
}

function getUserKycStatus(user: any) {
  return user?.kyc_status || "unknown";
}

function getUserBanStatus(user: any) {
  return user?.is_banned ? "banned" : "active";
}


function isVerifiedKyc(status: string) {
  const normalized = normalizeValue(status);

  return ["verified", "approved", "accepted"].includes(normalized);
}

function isPendingKyc(status: string) {
  const normalized = normalizeValue(status);

  return ["pending", "submitted", "in_review", "under_review"].includes(
    normalized
  );
}

function getUserCounts(users: any[]) {
  return users.reduce(
    (counts, user) => {
      if (user?.is_banned) counts.banned += 1;
      else counts.active += 1;

      const status = getUserKycStatus(user);

      if (isVerifiedKyc(status)) counts.verified += 1;
      if (isPendingKyc(status)) counts.pendingKyc += 1;

      return counts;
    },
    {
      active: 0,
      banned: 0,
      verified: 0,
      pendingKyc: 0,
    }
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  featured = false,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  featured?: boolean;
  tone?: "primary" | "success" | "danger" | "warning";
}) {
  const toneClasses =
    tone === "danger"
      ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
      : tone === "warning"
        ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
        : tone === "success"
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]";

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-3xl border p-4 shadow-[var(--shadow-card)] ${featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border-light)] bg-white"
        }`}
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full blur-2xl ${featured
            ? "bg-[var(--color-secondary)]/20"
            : "bg-[var(--color-secondary)]/10"
          }`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${featured ? "text-white/65" : "text-[var(--color-text-muted)]"
              }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 break-words text-lg font-black leading-tight ${featured ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${featured ? "text-white/65" : "text-[var(--color-text-muted)]"
              }`}
          >
            {helper}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${featured ? "bg-white/10 text-white" : toneClasses
            }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionIconButton({
  label,
  icon,
  variant,
  isLoading = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant: "neutral" | "danger" | "success";
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const variantClasses =
    variant === "danger"
      ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
      : variant === "success"
        ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
        : "border-[var(--color-border-light)] bg-white text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)]";

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

function ViewUserButton({ user }: { user: any }) {
  const userId = getMongoId(user);

  return (
    <Link
      to={`/users/${userId}`}
      aria-label="View user details"
      title="View Details"
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] transition-all duration-200 hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        View Details
      </span>
    </Link>
  );
}

function AdminUserFilters({
  searchValue,
  role,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onRoleChange,
  onClear,
}: {
  searchValue: string;
  role: RoleFilter;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: RoleFilter) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-user-search" className="sr-only">
            Search users
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-user-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, role, KYC, or account status..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="admin-user-role-filter" className="sr-only">
            Filter by role
          </label>

          <select
            id="admin-user-role-filter"
            value={role}
            onChange={(event) => {
              onRoleChange(event.target.value as RoleFilter);
            }}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
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
          users on this page.
        </span>

        {hasActiveFilters && (
          <span className="text-[var(--color-primary)]">
            Search and filters are applied to the current loaded page.
          </span>
        )}
      </div>
    </section>
  );
}

function UserCard({
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
  const kycStatus = normalizeValue(getUserKycStatus(user));
  const banStatus = getUserBanStatus(user);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/users/${userId}`}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {getPersonName(user)}
          </Link>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {getUserEmail(user)}
          </p>
        </div>

        <StatusBadge
          label={formatLabel(banStatus)}
          variant={user.is_banned ? "danger" : "success"}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Role
          </p>

          <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {formatLabel(getUserRole(user))}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            KYC
          </p>

          <div className="mt-1">
            <StatusBadge
              label={formatLabel(getUserKycStatus(user))}
              variant={getStatusVariant(kycStatus)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Joined
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          to={`/users/${userId}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Details
        </Link>

        {user.is_banned ? (
          <Button
            type="button"
            variant="outline"
            isLoading={isUnbanning}
            onClick={() => onUnban(userId)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <RefreshCcw className="h-4 w-4" />
            Unban User
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={() => onBan(user)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <Ban className="h-4 w-4" />
            Ban User
          </Button>
        )}
      </div>
    </article>
  );
}

function AdminUsersPage() {
  const [role, setRole] = useState<RoleFilter>("");
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const [banTarget, setBanTarget] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");
  const [processingUserId, setProcessingUserId] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminUsersQuery({
    role: role || undefined,
    page,
    limit: 20,
  });

  const [banUser, { isLoading: isBanning }] = useBanAdminUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanAdminUserMutation();

  const rawUsers = getApiList(data) as any[];

  const pageUsers = rawUsers.filter(
    (user: any) => normalizeValue(user?.role) !== "admin"
  );

  const users = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return pageUsers;

    return pageUsers.filter((user: any) => {
      const kycStatus = getUserKycStatus(user);
      const banStatus = getUserBanStatus(user);

      const searchText = [
        getPersonName(user),
        getUserEmail(user),
        getUserRole(user),
        kycStatus,
        banStatus,
        formatDate(user.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [pageUsers, searchValue]);

  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const counts = getUserCounts(pageUsers);
  const hasActiveFilters = searchValue.trim().length > 0 || role !== "";

  function clearFilters() {
    setRole("");
    setSearchValue("");
    setPage(1);
  }

  async function handleBan() {
    if (!banTarget || banReason.trim().length < 3) return;

    const userId = getMongoId(banTarget);

    try {
      setProcessingUserId(userId);

      await banUser({
        id: userId,
        reason: banReason.trim(),
      }).unwrap();

      setBanTarget(null);
      setBanReason("");

      await refetch();
    } finally {
      setProcessingUserId("");
    }
  }

  async function handleUnban(userId: string) {
    try {
      setProcessingUserId(userId);

      await unbanUser(userId).unwrap();

      await refetch();
    } finally {
      setProcessingUserId("");
    }
  }

  const banTargetId = banTarget ? getMongoId(banTarget) : "";

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
              Admin User Management
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review platform accounts, inspect user records, filter by role,
              and ban or restore access when needed.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              {role ? `${formatLabel(role)} Users` : "All Users"}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
              {users.length} shown on page
            </p>
          </div>
        </div>
      </section>

      {!isLoading && !isError && pageUsers.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Users"
              value={users.length}
              helper="After current filters"
              featured
              icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Active"
              value={counts.active}
              helper="Users with platform access"
              tone="success"
              icon={<UserCheck className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Banned"
              value={counts.banned}
              helper="Blocked accounts"
              tone="danger"
              icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Pending KYC"
              value={counts.pendingKyc}
              helper="Needs verification"
              tone="warning"
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminUserFilters
            searchValue={searchValue}
            role={role}
            shownCount={users.length}
            totalCount={pageUsers.length}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchValue}
            onRoleChange={(value) => {
              setRole(value);
              setPage(1);
              setSearchValue("");
            }}
            onClear={clearFilters}
          />
        </>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading users..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load users
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading platform users.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
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
            <UsersRound className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No users found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No users match your current search or role filter."
              : "There are no platform users available right now."}
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

              return (
                <UserCard
                  key={userId}
                  user={user}
                  isUnbanning={isUnbanning && processingUserId === userId}
                  onBan={setBanTarget}
                  onUnban={handleUnban}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    User Directory
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Review user status, role, KYC state, and account access.
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
                  <th className="w-[28%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    User
                  </th>

                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Role
                  </th>

                  <th className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    KYC
                  </th>

                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Account
                  </th>

                  <th className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Joined
                  </th>

                  <th className="w-[10%] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user: any) => {
                  const userId = getMongoId(user);
                  const kycStatus = normalizeValue(getUserKycStatus(user));
                  const isThisUnbanning =
                    isUnbanning && processingUserId === userId;

                  return (
                    <tr
                      key={userId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/users/${userId}`}
                          className="line-clamp-1 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {getPersonName(user)}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getUserEmail(user)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {formatLabel(getUserRole(user))}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatLabel(getUserKycStatus(user))}
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

                      <td className="px-4 py-5 text-center">
                        <div className="flex min-w-[92px] items-center justify-center gap-2">
                          <ViewUserButton user={user} />

                          {user.is_banned ? (
                            <ActionIconButton
                              label="Unban User"
                              variant="success"
                              isLoading={isThisUnbanning}
                              disabled={isThisUnbanning}
                              onClick={() => handleUnban(userId)}
                              icon={
                                <RefreshCcw
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              }
                            />
                          ) : (
                            <ActionIconButton
                              label="Ban User"
                              variant="danger"
                              onClick={() => setBanTarget(user)}
                              icon={
                                <Ban
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Page{" "}
          <span className="font-black text-[var(--color-primary)]">
            {pagination.page}
          </span>{" "}
          of{" "}
          <span className="font-black text-[var(--color-primary)]">
            {totalPages}
          </span>
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
            disabled={page >= totalPages}
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
        description={`This will block ${banTarget ? getPersonName(banTarget) : "this user"
          } from platform access until an admin removes the ban.`}
        icon={<Ban className="h-5 w-5" />}
        confirmLabel="Ban User"
        loadingLabel="Banning..."
        isLoading={isBanning && processingUserId === banTargetId}
        onCancel={() => {
          setBanTarget(null);
          setBanReason("");
        }}
        onConfirm={handleBan}
      >
        <div>
          <label
            htmlFor="ban-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Ban reason
          </label>

          <textarea
            id="ban-reason"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            rows={4}
            placeholder="Enter ban reason..."
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />

          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Minimum 3 characters are required before the user can be banned.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default AdminUsersPage;
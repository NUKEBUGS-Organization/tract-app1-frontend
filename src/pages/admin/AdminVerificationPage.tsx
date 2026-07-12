import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle,
  Eye,
  FileText,
  FilterX,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import {
  useApproveKycUserMutation,
  useGetAdminUsersQuery,
  useGetAdminVerificationsQuery,
  useGetPendingAdminVerificationsQuery,
  useGetPendingKycUsersQuery,
  useRejectKycUserMutation,
} from "../../services/adminService";

import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  displayValue,
  formatDateTime,
  getApiDoc,
  getApiList,
  getMongoId,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

type VerificationGroupFilter = "all" | "kyc" | "partner";
type VerificationStatusFilter = "pending" | "all" | "approved" | "rejected";
type PartnerTypeFilter = "all" | "realtor" | "wholesaler";

type VerificationItem = {
  id: string;
  kind: "kyc" | "partner";
  data: any;
  user: any;
  type: string;
  status: string;
};

function formatLabel(value: any) {
  if (!value) return "-";

  return value
    .toString()
    .split("_")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getEmail(user: any) {
  const doc = getApiDoc(user);

  return doc?.email || "-";
}

function getRole(user: any) {
  const doc = getApiDoc(user);

  return doc?.role || "-";
}

function isAdminUser(user: any) {
  return normalizeValue(getRole(user)) === "admin";
}

function getUserKycStatus(user: any, localStatuses: Record<string, string>) {
  const doc = getApiDoc(user);
  const userId = getMongoId(doc);

  return localStatuses[userId] || doc?.kyc_status || "pending";
}

function getVerificationUser(verification: any) {
  const doc = getApiDoc(verification);
  const user = doc?.user_id;

  if (user && typeof user === "object") {
    return getApiDoc(user);
  }

  return {};
}

function getVerificationType(verification: any) {
  const doc = getApiDoc(verification);

  return doc?.type || "-";
}

function getVerificationStatus(verification: any) {
  const doc = getApiDoc(verification);

  return doc?.status || "pending";
}

function getSubmittedAt(item: VerificationItem) {
  const doc = getApiDoc(item.data);
  const user = getApiDoc(item.user);

  return doc?.submitted_at || doc?.createdAt || doc?.updatedAt || user?.createdAt;
}

function isPendingStatus(status: string) {
  const normalized = normalizeValue(status);

  return ["pending", "submitted", "in_review", "under_review"].includes(
    normalized
  );
}

function isApprovedStatus(status: string) {
  const normalized = normalizeValue(status);

  return normalized === "approved" || normalized === "verified";
}

function isRejectedStatus(status: string) {
  return normalizeValue(status) === "rejected";
}

function matchesStatus(status: string, filter: VerificationStatusFilter) {
  if (filter === "all") return true;
  if (filter === "pending") return isPendingStatus(status);
  if (filter === "approved") return isApprovedStatus(status);
  if (filter === "rejected") return isRejectedStatus(status);

  return true;
}

function buildSearchText(item: VerificationItem) {
  const doc = getApiDoc(item.data);
  const user = getApiDoc(item.user);

  return [
    item.kind,
    item.type,
    item.status,
    getPersonName(user),
    getEmail(user),
    getRole(user),
    doc?.kyc_status,
    doc?.state_license_number,
    doc?.brokerage_name,
    doc?.managing_broker,
    doc?.office_address,
    doc?.document_file_name,
    doc?.rejection_reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {label}
          </p>

          <p className="mt-1 font-serif text-2xl font-black leading-none text-[var(--color-primary)]">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AdminVerificationFilters({
  searchValue,
  groupFilter,
  statusFilter,
  partnerTypeFilter,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onGroupFilterChange,
  onStatusFilterChange,
  onPartnerTypeFilterChange,
  onClear,
}: {
  searchValue: string;
  groupFilter: VerificationGroupFilter;
  statusFilter: VerificationStatusFilter;
  partnerTypeFilter: PartnerTypeFilter;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onGroupFilterChange: (value: VerificationGroupFilter) => void;
  onStatusFilterChange: (value: VerificationStatusFilter) => void;
  onPartnerTypeFilterChange: (value: PartnerTypeFilter) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="verification-search" className="sr-only">
            Search verifications
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
            placeholder="Search by name, email, license, brokerage, document, or status..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(event) =>
            onGroupFilterChange(event.target.value as VerificationGroupFilter)
          }
          className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
        >
          <option value="all">All groups</option>
          <option value="kyc">KYC users</option>
          <option value="partner">Partner verifications</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as VerificationStatusFilter)
          }
          className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
        >
          <option value="pending">Pending</option>
          <option value="all">All statuses</option>
          <option value="approved">Approved / Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={partnerTypeFilter}
          onChange={(event) =>
            onPartnerTypeFilterChange(event.target.value as PartnerTypeFilter)
          }
          disabled={groupFilter !== "partner"}
          className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All partners</option>
          <option value="realtor">Realtor</option>
          <option value="wholesaler">Wholesaler</option>
        </select>

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

      <div className="mt-3 text-xs font-semibold text-[var(--color-text-muted)]">
        Showing{" "}
        <strong className="text-[var(--color-primary)]">{shownCount}</strong>{" "}
        of{" "}
        <strong className="text-[var(--color-primary)]">{totalCount}</strong>{" "}
        verifications in this view.
      </div>
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-[var(--color-primary)]">
        {displayValue(value)}
      </p>
    </div>
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

function VerificationCard({
  item,
  isApproving,
  isRejecting,
  onApproveKyc,
  onRejectKyc,
  onOpenPartner,
}: {
  item: VerificationItem;
  isApproving: boolean;
  isRejecting: boolean;
  onApproveKyc: (item: VerificationItem) => void;
  onRejectKyc: (item: VerificationItem) => void;
  onOpenPartner: (item: VerificationItem) => void;
}) {
  const user = getApiDoc(item.user);
  const isPending = isPendingStatus(item.status);
  const isPartner = item.kind === "partner";

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              label={isPartner ? formatLabel(item.type) : "KYC"}
              variant={isPartner ? "gold" : "neutral"}
            />

            <StatusBadge
              label={formatLabel(item.status)}
              variant={getStatusVariant(item.status) as any}
            />
          </div>

          <p className="break-words text-base font-black leading-6 text-[var(--color-primary)]">
            {getPersonName(user)}
          </p>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {getEmail(user)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBox label="Role" value={formatLabel(getRole(user))} />
        <InfoBox label="Submitted" value={formatDateTime(getSubmittedAt(item))} />
        <InfoBox
          label="Action State"
          value={isPending ? "Review needed" : "No action needed"}
        />
        <InfoBox
          label={isPartner ? "Verification ID" : "User ID"}
          value={item.id}
        />
      </div>

      {isPartner ? (
        <Button
          type="button"
          variant="primary"
          onClick={() => onOpenPartner(item)}
          className="mt-5 w-full justify-center px-4 py-3 text-xs"
        >
          <Eye className="h-4 w-4" />
          Review Details
        </Button>
      ) : isPending ? (
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary"
            isLoading={isApproving}
            disabled={isApproving || isRejecting}
            onClick={() => onApproveKyc(item)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <CheckCircle className="h-4 w-4" />
            Approve KYC
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isRejecting}
            disabled={isApproving || isRejecting}
            onClick={() => onRejectKyc(item)}
            className="w-full justify-center px-4 py-3 text-xs"
          >
            <XCircle className="h-4 w-4" />
            Reject KYC
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function AdminVerificationPage() {
  const navigate = useNavigate();

  const [groupFilter, setGroupFilter] =
    useState<VerificationGroupFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<VerificationStatusFilter>("pending");
  const [partnerTypeFilter, setPartnerTypeFilter] =
    useState<PartnerTypeFilter>("all");
  const [searchValue, setSearchValue] = useState("");

  const [approveKycTarget, setApproveKycTarget] =
    useState<VerificationItem | null>(null);
  const [rejectKycTarget, setRejectKycTarget] =
    useState<VerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingKey, setProcessingKey] = useState("");

  const [localKycStatuses, setLocalKycStatuses] = useState<
    Record<string, string>
  >({});

  const shouldLoadKyc = groupFilter === "all" || groupFilter === "kyc";
  const shouldLoadPartner = groupFilter === "all" || groupFilter === "partner";
  const usePendingEndpoint = statusFilter === "pending";

  const pendingKycQuery = useGetPendingKycUsersQuery(undefined, {
    skip: !shouldLoadKyc || !usePendingEndpoint,
  });

  const allUsersQuery = useGetAdminUsersQuery(
    {
      page: 1,
      limit: 500,
    },
    {
      skip: !shouldLoadKyc || usePendingEndpoint,
    }
  );

  const pendingPartnerQuery = useGetPendingAdminVerificationsQuery(
    {
      page: 1,
      limit: 500,
    },
    {
      skip: !shouldLoadPartner || !usePendingEndpoint,
    }
  );

  const allPartnerQuery = useGetAdminVerificationsQuery(
    {
      page: 1,
      limit: 500,
      ...(statusFilter !== "all" && statusFilter !== "pending"
        ? { status: statusFilter }
        : {}),
      ...(partnerTypeFilter !== "all" ? { type: partnerTypeFilter } : {}),
    },
    {
      skip: !shouldLoadPartner || usePendingEndpoint,
    }
  );

  const activeKycQuery = usePendingEndpoint ? pendingKycQuery : allUsersQuery;
  const activePartnerQuery = usePendingEndpoint
    ? pendingPartnerQuery
    : allPartnerQuery;

  const [approveKyc, { isLoading: isApprovingKyc }] =
    useApproveKycUserMutation();
  const [rejectKyc, { isLoading: isRejectingKyc }] =
    useRejectKycUserMutation();

  const rawKycUsers = shouldLoadKyc
    ? (getApiList(activeKycQuery.data) as any[])
    : [];

  const rawPartnerVerifications = shouldLoadPartner
    ? (getApiList(activePartnerQuery.data) as any[])
    : [];

  const verificationItems = useMemo<VerificationItem[]>(() => {
    const kycItems: VerificationItem[] = rawKycUsers
      .filter((user: any) => !isAdminUser(user))
      .map((user: any) => {
        const doc = getApiDoc(user);
        const id = getMongoId(doc);
        const status = getUserKycStatus(doc, localKycStatuses);

        return {
          id,
          kind: "kyc" as const,
          data: doc,
          user: doc,
          type: "kyc",
          status,
        };
      })
      .filter((item) => item.id && matchesStatus(item.status, statusFilter));

    const partnerItems: VerificationItem[] = rawPartnerVerifications
      .map((verification: any) => {
        const doc = getApiDoc(verification);
        const id = getMongoId(doc);
        const user = getVerificationUser(doc);
        const type = getVerificationType(doc);
        const status = getVerificationStatus(doc);

        return {
          id,
          kind: "partner" as const,
          data: doc,
          user,
          type,
          status,
        };
      })
      .filter((item) => {
        if (!item.id) return false;

        if (
          groupFilter === "partner" &&
          partnerTypeFilter !== "all" &&
          normalizeValue(item.type) !== partnerTypeFilter
        ) {
          return false;
        }

        return matchesStatus(item.status, statusFilter);
      });

    return [...kycItems, ...partnerItems].sort((a, b) => {
      const aTime = new Date(getSubmittedAt(a) || 0).getTime();
      const bTime = new Date(getSubmittedAt(b) || 0).getTime();

      return bTime - aTime;
    });
  }, [
    rawKycUsers,
    rawPartnerVerifications,
    localKycStatuses,
    statusFilter,
    groupFilter,
    partnerTypeFilter,
  ]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return verificationItems;

    return verificationItems.filter((item) =>
      buildSearchText(item).includes(normalizedSearch)
    );
  }, [verificationItems, searchValue]);

  const pendingCount = verificationItems.filter((item) =>
    isPendingStatus(item.status)
  ).length;

  const kycCount = verificationItems.filter(
    (item) => item.kind === "kyc"
  ).length;

  const partnerCount = verificationItems.filter(
    (item) => item.kind === "partner"
  ).length;

  const isLoading =
    (shouldLoadKyc &&
      (activeKycQuery.isLoading || activeKycQuery.isFetching)) ||
    (shouldLoadPartner &&
      (activePartnerQuery.isLoading || activePartnerQuery.isFetching));

  const isError =
    (shouldLoadKyc && activeKycQuery.isError) ||
    (shouldLoadPartner && activePartnerQuery.isError);

  const hasActiveFilters =
    searchValue.trim().length > 0 ||
    groupFilter !== "all" ||
    statusFilter !== "pending" ||
    partnerTypeFilter !== "all";

  function clearFilters() {
    setSearchValue("");
    setGroupFilter("all");
    setStatusFilter("pending");
    setPartnerTypeFilter("all");
  }

  function refetchQueues() {
    if (shouldLoadKyc) {
      activeKycQuery.refetch();
    }

    if (shouldLoadPartner) {
      activePartnerQuery.refetch();
    }
  }

  function getItemProcessingKey(item: VerificationItem) {
    return `${item.kind}:${item.id}`;
  }

  function openPartnerDetails(item: VerificationItem) {
    navigate(`/verifications/${item.id}`);
  }

  async function handleApproveKyc() {
    if (!approveKycTarget) return;

    const key = getItemProcessingKey(approveKycTarget);

    try {
      setProcessingKey(key);

      await approveKyc(approveKycTarget.id).unwrap();

      setLocalKycStatuses((current) => ({
        ...current,
        [approveKycTarget.id]: "verified",
      }));

      setApproveKycTarget(null);
      refetchQueues();
    } finally {
      setProcessingKey("");
    }
  }

  async function handleRejectKyc() {
    if (!rejectKycTarget || rejectReason.trim().length < 3) return;

    const key = getItemProcessingKey(rejectKycTarget);

    try {
      setProcessingKey(key);

      await rejectKyc({
        id: rejectKycTarget.id,
        reason: rejectReason.trim(),
      }).unwrap();

      setLocalKycStatuses((current) => ({
        ...current,
        [rejectKycTarget.id]: "rejected",
      }));

      setRejectKycTarget(null);
      setRejectReason("");
      refetchQueues();
    } finally {
      setProcessingKey("");
    }
  }

  const approveKycTargetKey = approveKycTarget
    ? getItemProcessingKey(approveKycTarget)
    : "";

  const rejectKycTargetKey = rejectKycTarget
    ? getItemProcessingKey(rejectKycTarget)
    : "";

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
              Review KYC users, realtor license submissions, and wholesaler
              proof documents from one admin queue.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <SummaryCard
              label="Pending"
              value={pendingCount}
              description="Waiting review"
              icon={<ShieldCheck className="h-5 w-5" />}
            />

            <SummaryCard
              label="KYC"
              value={kycCount}
              description="User identity"
              icon={<UserCheck className="h-5 w-5" />}
            />

            <SummaryCard
              label="Partners"
              value={partnerCount}
              description="Realtor / wholesaler"
              icon={<FileText className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {!isLoading && !isError && (
        <AdminVerificationFilters
          searchValue={searchValue}
          groupFilter={groupFilter}
          statusFilter={statusFilter}
          partnerTypeFilter={partnerTypeFilter}
          shownCount={filteredItems.length}
          totalCount={verificationItems.length}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchValue}
          onGroupFilterChange={(value) => {
            setGroupFilter(value);
            setSearchValue("");

            if (value !== "partner") {
              setPartnerTypeFilter("all");
            }
          }}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setSearchValue("");
          }}
          onPartnerTypeFilterChange={(value) => {
            setPartnerTypeFilter(value);
            setSearchValue("");
          }}
          onClear={clearFilters}
        />
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading verification queue..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load verification queue
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading verification records.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={refetchQueues}
              className="justify-center"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No verifications found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No verification records match your current filters."
              : "There are no pending verification records right now."}
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
            {filteredItems.map((item) => {
              const key = getItemProcessingKey(item);

              return (
                <VerificationCard
                  key={key}
                  item={item}
                  isApproving={isApprovingKyc && processingKey === key}
                  isRejecting={isRejectingKyc && processingKey === key}
                  onApproveKyc={setApproveKycTarget}
                  onRejectKyc={setRejectKycTarget}
                  onOpenPartner={openPartnerDetails}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Verification Records
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Review identity, license, and document verification records.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {filteredItems.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[27%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    User
                  </th>

                  <th className="w-[17%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Group
                  </th>

                  <th className="w-[17%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Status
                  </th>

                  <th className="w-[23%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Submitted
                  </th>

                  <th className="w-[16%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const key = getItemProcessingKey(item);
                  const user = getApiDoc(item.user);
                  const isPartner = item.kind === "partner";
                  const isPending = isPendingStatus(item.status);

                  const isThisApproving =
                    isApprovingKyc && processingKey === key;

                  const isThisRejecting =
                    isRejectingKyc && processingKey === key;

                  return (
                    <tr
                      key={key}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 font-black text-[var(--color-primary)]">
                          {getPersonName(user)}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getEmail(user)}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[var(--color-text-muted)]">
                          {formatLabel(getRole(user))}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={isPartner ? formatLabel(item.type) : "KYC"}
                          variant={isPartner ? "gold" : "neutral"}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          label={formatLabel(item.status)}
                          variant={getStatusVariant(item.status) as any}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {formatDateTime(getSubmittedAt(item))}
                      </td>

                      <td className="px-6 py-5">
                        {isPartner ? (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => openPartnerDetails(item)}
                              className="justify-center px-4 py-2 text-xs"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                          </div>
                        ) : isPending ? (
                          <div className="flex min-w-[92px] items-center justify-center gap-2">
                            <ActionIconButton
                              label="Approve KYC"
                              variant="success"
                              isLoading={isThisApproving}
                              disabled={isThisApproving || isThisRejecting}
                              onClick={() => setApproveKycTarget(item)}
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
                              onClick={() => setRejectKycTarget(item)}
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
        isOpen={Boolean(approveKycTarget)}
        variant="success"
        title="Approve KYC?"
        description={`Are you sure you want to approve KYC for ${
          approveKycTarget ? getPersonName(approveKycTarget.user) : "this user"
        }?`}
        icon={<CheckCircle className="h-5 w-5" />}
        confirmLabel="Approve KYC"
        loadingLabel="Approving..."
        isLoading={isApprovingKyc && processingKey === approveKycTargetKey}
        onCancel={() => setApproveKycTarget(null)}
        onConfirm={handleApproveKyc}
      />

      <ConfirmModal
        isOpen={Boolean(rejectKycTarget)}
        variant="danger"
        title="Reject KYC?"
        description={`This will mark ${
          rejectKycTarget ? getPersonName(rejectKycTarget.user) : "this user"
        }'s KYC as rejected.`}
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject KYC"
        loadingLabel="Rejecting..."
        isLoading={isRejectingKyc && processingKey === rejectKycTargetKey}
        onCancel={() => {
          setRejectKycTarget(null);
          setRejectReason("");
        }}
        onConfirm={handleRejectKyc}
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
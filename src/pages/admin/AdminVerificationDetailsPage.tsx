import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  FileText,
  ImageIcon,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useApproveAdminVerificationMutation,
  useGetAdminVerificationQuery,
  useRejectAdminVerificationMutation,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  displayValue,
  formatDateTime,
  getApiDoc,
  getPersonName,
  getStatusVariant,
  normalizeValue,
} from "../../utils/adminUtils";

function formatLabel(value: any) {
  if (!value) return "-";

  return value
    .toString()
    .split("_")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getVerificationUser(verification: any) {
  const doc = getApiDoc(verification);
  const user = doc?.user_id;

  if (user && typeof user === "object") {
    return getApiDoc(user);
  }

  return {};
}

function getEmail(user: any) {
  const doc = getApiDoc(user);

  return doc?.email || "-";
}

function getRole(user: any) {
  const doc = getApiDoc(user);

  return doc?.role || "-";
}

function getStatus(verification: any, localStatus: string) {
  const doc = getApiDoc(verification);

  return localStatus || doc?.status || "pending";
}

function isPendingStatus(status: string) {
  return normalizeValue(status) === "pending";
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) return message.join(", ");

  return message || fallback;
}

function isImageFile(url?: string | null, fileName?: string | null) {
  const value = `${url || ""} ${fileName || ""}`.toLowerCase();

  return (
    value.includes(".jpg") ||
    value.includes(".jpeg") ||
    value.includes(".png") ||
    value.includes(".webp") ||
    value.includes(".gif") ||
    value.includes("/image/upload/")
  );
}

function isPdfFile(url?: string | null, fileName?: string | null) {
  const value = `${url || ""} ${fileName || ""}`.toLowerCase();

  return value.includes(".pdf") || value.includes("application/pdf");
}

function InfoBox({
  label,
  value,
  children,
}: {
  label: string;
  value?: any;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>

      <div className="mt-1 break-words text-sm font-black text-[var(--color-primary)]">
        {children ?? displayValue(value)}
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-xl font-black leading-tight text-[var(--color-primary)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function DocumentPreview({
  documentUrl,
  documentName,
  canTakeAction,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: {
  documentUrl?: string | null;
  documentName?: string | null;
  canTakeAction: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const showImagePreview = isImageFile(documentUrl, documentName);
  const showPdfPreview = isPdfFile(documentUrl, documentName);

  if (!documentUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-6 text-center">
        <FileText className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />

        <p className="mt-3 text-sm font-black text-[var(--color-primary)]">
          No document uploaded
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
          This wholesaler verification does not have a proof document.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          <a
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Document
          </a>


          {canTakeAction && (
            <>
              <Button
                type="button"
                variant="primary"
                isLoading={isApproving}
                disabled={isApproving || isRejecting}
                onClick={onApprove}
                className="justify-center px-5 py-2.5 text-xs"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>

              <Button
                type="button"
                variant="danger"
                isLoading={isRejecting}
                disabled={isApproving || isRejecting}
                onClick={onReject}
                className="justify-center px-5 py-2.5 text-xs"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {showImagePreview ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-light)] bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <ImageIcon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />

              <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Image Preview
              </p>
            </div>

            <StatusBadge label="Preview" variant="neutral" />
          </div>

          <div className="max-h-[720px] overflow-auto bg-white p-3">
            <img
              src={documentUrl}
              alt={documentName || "Uploaded verification document"}
              className="mx-auto max-h-[680px] w-auto max-w-full rounded-2xl object-contain shadow-sm"
              loading="lazy"
            />
          </div>
        </div>
      ) : showPdfPreview ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-light)] bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />

              <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                PDF Preview
              </p>
            </div>

            <StatusBadge label="PDF" variant="neutral" />
          </div>

          <iframe
            src={documentUrl}
            title={documentName || "Uploaded verification PDF"}
            className="h-[680px] w-full bg-white"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-[var(--color-primary)]" />

          <p className="mt-3 text-sm font-black text-[var(--color-primary)]">
            Preview not available
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            This file type cannot be previewed inside the page. Open it in a new
            tab to review.
          </p>
        </div>
      )}
    </div>
  );
}

function AdminVerificationDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [localStatus, setLocalStatus] = useState("");

  const {
    data: verificationResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminVerificationQuery(id, {
    skip: !id,
  });

  const [approveVerification, { isLoading: isApproving }] =
    useApproveAdminVerificationMutation();

  const [rejectVerification, { isLoading: isRejecting }] =
    useRejectAdminVerificationMutation();

  const verification = getApiDoc(verificationResponse);
  const user = getVerificationUser(verification);
  const status = getStatus(verification, localStatus);
  const type = normalizeValue(verification?.type);
  const canTakeAction = isPendingStatus(status);

  async function handleApprove() {
    if (!id) return;

    try {
      setActionError("");

      await approveVerification(id).unwrap();

      setLocalStatus("approved");
      setIsApproveModalOpen(false);
      refetch();
    } catch (error: any) {
      setActionError(getErrorMessage(error, "Unable to approve verification."));
    }
  }

  async function handleReject() {
    if (!id) return;

    if (rejectReason.trim().length < 3) {
      setActionError("Rejection reason must be at least 3 characters.");
      return;
    }

    try {
      setActionError("");

      await rejectVerification({
        id,
        reason: rejectReason.trim(),
      }).unwrap();

      setLocalStatus("rejected");
      setIsRejectModalOpen(false);
      setRejectReason("");
      refetch();
    } catch (error: any) {
      setActionError(getErrorMessage(error, "Unable to reject verification."));
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <Loader label="Loading verification details..." />
      </div>
    );
  }

  if (isError || !verification) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-base font-black text-[var(--color-danger)]">
          Failed to load verification
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          This verification record could not be loaded.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/verifications")}
            className="justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => refetch()}
            className="justify-center"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/verifications")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Verifications
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Partner Verification Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {getPersonName(user)}
            </h1>

            <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
              {getEmail(user)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={formatLabel(verification?.type)}
                variant="gold"
              />

              <StatusBadge
                label={formatLabel(status)}
                variant={getStatusVariant(status) as any}
              />

              <StatusBadge label={formatLabel(getRole(user))} variant="neutral" />
            </div>
          </div>

          {canTakeAction && (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setActionError("");
                  setIsApproveModalOpen(true);
                }}
                className="shrink-0 justify-center px-5 py-3 text-xs"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setActionError("");
                  setIsRejectModalOpen(true);
                }}
                className="shrink-0 justify-center px-5 py-3 text-xs"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-4 py-3 text-sm font-semibold text-[var(--color-danger)]">
          {actionError}
        </div>
      )}

      <SectionBlock
        title="User Information"
        description="Partner account linked to this verification submission."
        icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoBox label="Full Name" value={getPersonName(user)} />
          <InfoBox label="Email" value={getEmail(user)} />
          <InfoBox label="Role" value={formatLabel(getRole(user))} />
          <InfoBox
            label="Verification Type"
            value={formatLabel(verification?.type)}
          />
          <InfoBox label="Status" value={formatLabel(status)} />
          <InfoBox
            label="Submitted"
            value={formatDateTime(verification?.submitted_at)}
          />
          <InfoBox
            label="Reviewed At"
            value={formatDateTime(verification?.reviewed_at)}
          />
          <InfoBox label="Verification ID" value={verification?._id} />
        </div>
      </SectionBlock>

      {type === "realtor" && (
        <SectionBlock
          title="Realtor License Details"
          description="Review these license and brokerage details before approving."
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              label="State License Number"
              value={verification?.state_license_number}
            />
            <InfoBox
              label="Brokerage Name"
              value={verification?.brokerage_name}
            />
            <InfoBox
              label="Managing Broker"
              value={verification?.managing_broker}
            />
            <InfoBox
              label="Office Address"
              value={verification?.office_address}
            />
          </div>
        </SectionBlock>
      )}

      {type === "wholesaler" && (
        <SectionBlock
          title="Wholesaler Proof Document"
          description="Review the uploaded proof of activity document before approving."
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
        >
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              label="Document Name"
              value={verification?.document_file_name}
            />

            <InfoBox
              label="Document Public ID"
              value={verification?.document_public_id}
            />
          </div>

          <DocumentPreview
            documentUrl={verification?.document_url}
            documentName={verification?.document_file_name}
            canTakeAction={canTakeAction}
            isApproving={isApproving}
            isRejecting={isRejecting}
            onApprove={() => {
              setActionError("");
              setIsApproveModalOpen(true);
            }}
            onReject={() => {
              setActionError("");
              setIsRejectModalOpen(true);
            }}
          />
        </SectionBlock>
      )}

      {verification?.rejection_reason && (
        <SectionBlock
          title="Rejection Information"
          description="Previous rejection reason saved on this verification."
          icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
        >
          <InfoBox
            label="Rejection Reason"
            value={verification.rejection_reason}
          />
        </SectionBlock>
      )}

      <ConfirmModal
        isOpen={isApproveModalOpen}
        variant="success"
        title="Approve partner verification?"
        description={`This will approve ${getPersonName(
          user
        )}'s ${formatLabel(verification?.type)} verification.`}
        icon={<CheckCircle className="h-5 w-5" />}
        confirmLabel="Approve Verification"
        loadingLabel="Approving..."
        isLoading={isApproving}
        onCancel={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
      />

      <ConfirmModal
        isOpen={isRejectModalOpen}
        variant="danger"
        title="Reject partner verification?"
        description={`This will reject ${getPersonName(
          user
        )}'s verification and save the rejection reason.`}
        icon={<XCircle className="h-5 w-5" />}
        confirmLabel="Reject Verification"
        loadingLabel="Rejecting..."
        isLoading={isRejecting}
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
          setActionError("");
        }}
        onConfirm={handleReject}
      >
        <div>
          <label
            htmlFor="verification-reject-reason"
            className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
          >
            Rejection reason
          </label>

          <textarea
            id="verification-reject-reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            placeholder={
              type === "realtor"
                ? "Example: State license number could not be verified."
                : "Example: Uploaded proof document is not readable or valid."
            }
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

export default AdminVerificationDetailsPage;
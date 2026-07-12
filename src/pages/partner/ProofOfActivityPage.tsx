import { useRef, useState } from "react";
import { Link } from "react-router";
import {
  FileCheck2,
  UploadCloud,
  FileText,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useGetMeQuery } from "../../services/userService";
import {
  useGetProofOfActivityStatusQuery,
  useUploadProofOfActivityMutation,
} from "../../services/verificationService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ProofOfActivityPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { data: meData } = useGetMeQuery();
  const { data: statusData, refetch: refetchStatus } =
    useGetProofOfActivityStatusQuery();

  const [uploadProofOfActivity, { isLoading }] =
    useUploadProofOfActivityMutation();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const profile = meData?.data ?? meData;
  const statusPayload = statusData?.data ?? statusData;

  const status: "not_submitted" | "pending" | "approved" | "rejected" =
    statusPayload?.status ||
    profile?.proof_of_activity_status ||
    "not_submitted";

  const rejectionReason =
    statusPayload?.rejection_reason || profile?.proof_of_activity_rejection_reason;

  const isApproved = status === "approved";
  const isPending = status === "pending" || justSubmitted;
  const isRejected = status === "rejected" && !justSubmitted;

  function handleFileSelect(selected: File | null | undefined) {
    setError(null);

    if (!selected) return;

    const ext = `.${selected.name.split(".").pop()?.toLowerCase()}`;

    if (!ACCEPTED_TYPES.includes(ext)) {
      setError("Please upload a PDF, JPG, or PNG file.");
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selected);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files?.[0]);
  }

  function handleRemoveFile() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!file) return;

    try {
      setError(null);
      await uploadProofOfActivity({ file }).unwrap();
      setJustSubmitted(true);
      setFile(null);
      refetchStatus();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Upload failed. Please try again.";
      setError(message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-150px)] space-y-8">
      <section
        className={`relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-card)] ${isDark
          ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
          : "bg-[var(--color-primary)]"
          }`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/5" />

        <div className="relative max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
            <FileCheck2 className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Professional Verification
            </span>
          </div>

          <h1
            className={`font-serif text-3xl font-black lg:text-4xl ${isDark ? "text-white" : "text-white"
              }`}
          >
            Proof of activity
          </h1>

          <p
            className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-white/50" : "text-white/60"
              }`}
          >
            Upload a past contract showing your legal name, dated within the
            last 3–6 months. This confirms you're an active wholesaler and is
            reviewed by our admin team before you can bid on properties.
          </p>
        </div>
      </section>

      {/* ── Approved state ── */}
      {isApproved && (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
            ? "border-white/10 bg-white/[0.06]"
            : "border-[var(--color-border-light)] bg-white"
            }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isDark
              ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
              : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              }`}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Proof of activity verified — Full platform access
            </p>
            <p
              className={`mt-0.5 text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
            >
              You're all set. Your account has full access to the Live
              Property Stream.
            </p>
          </div>
          <Link
            to="/properties"
            className={`inline-flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${isDark
              ? "border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
              : "border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20"
              }`}
          >
            Browse Stream
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Pending state ── */}
      {isPending && !isApproved && (
        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
            ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/[0.08]"
            : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
            }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isDark
              ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
              }`}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-warning)]"
                }`}
            >
              Pending admin approval
            </p>
            <p
              className={`mt-1 text-xs leading-6 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                }`}
            >
              Your document has been submitted and is awaiting review by our
              admin team. This typically takes 1–2 business days. You can bid on
              properties once approved.
            </p>
          </div>
        </div>
      )}

      {/* ── Rejected state ── */}
      {isRejected && (
        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
            ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/[0.08]"
            : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10"
            }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isDark
              ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
              : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              }`}
          >
            <XCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-danger)]"
                }`}
            >
              Submission rejected
            </p>
            <p
              className={`mt-1 text-xs leading-6 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                }`}
            >
              {rejectionReason ||
                "Your document didn't meet our requirements. Please re-upload a valid contract with your legal name from the last 3–6 months."}
            </p>
          </div>
        </div>
      )}

      {!isApproved && !isPending && (
        <section
          className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[var(--color-border-light)] bg-white"
            }`}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isDark
                ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                }`}
            >
              <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>
            <div>
              <h2
                className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
              >
                {isRejected ? "Re-upload your contract" : "Upload your contract"}
              </h2>
              <p
                className={`text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
              >
                PDF, JPG or PNG · max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>

          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center transition ${isDark
                ? "border-white/15 bg-white/[0.02] hover:border-[var(--color-secondary)]/40 hover:bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] hover:border-[var(--color-secondary)]/40 hover:bg-[var(--color-bg-soft)]/80"
                }`}
            >
              <UploadCloud
                className={`h-8 w-8 ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
                  }`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"
                    }`}
                >
                  Click to upload, or drag and drop
                </p>
                <p
                  className={`mt-1 text-xs ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  Contract must show your legal name and a date within the
                  last 3–6 months
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 ${isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${isDark
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  }`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"
                    }`}
                >
                  {file.name}
                </p>
                <p
                  className={`text-xs ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Remove file"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isDark
                  ? "text-white/40 hover:bg-white/10 hover:text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"
                  }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-xs font-semibold ${isDark
                ? "bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)]"
                : "bg-red-50 border border-red-300 text-red-700"
                }`}
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={!file}
              isLoading={isLoading}
              loadingText="Submitting..."
              onClick={handleSubmit}
            >
              Submit for review
            </Button>
          </div>
        </section>
      )}

      {/* ── Info footer ── */}
      <div
        className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 ${isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
          }`}
      >
        <ShieldCheck
          className={`h-3.5 w-3.5 ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
            }`}
        />
        <p
          className={`text-center text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
            }`}
        >
          Your document is reviewed manually by the TRACT admin team. No
          personal contact information is shared with other users.
        </p>
      </div>
    </div>
  );
}
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

const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ProofOfActivityPage() {
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
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 60%, #0a2518 100%)",
          borderRadius: 28,
          padding: "44px 48px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(23, 77, 52, 0.28)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "1.5px solid rgba(212,175,55,0.18)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 560, position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <FileCheck2 size={13} style={{ color: "var(--color-secondary)" }} />
            <span
              style={{
                color: "var(--color-secondary)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Professional Verification
            </span>
          </div>

          <h1
            className="font-serif"
            style={{
              color: "#fff",
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 900,
              lineHeight: 1.18,
              marginBottom: 14,
              letterSpacing: "-0.01em",
            }}
          >
            Proof of activity
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13.5,
              lineHeight: 1.75,
              maxWidth: 460,
            }}
          >
            Upload a past contract showing your legal name, dated within the
            last 3–6 months. This confirms you're an active wholesaler and is
            reviewed by our admin team before your dashboard unlocks.
          </p>
        </div>
      </section>

      {/* Approved state */}
      {isApproved && (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              Proof of activity verified
            </p>
            <p className="mt-0.5 text-xs text-white/40">
              You're all set. Your account has full access to the Live
              Property Stream.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)]/10"
          >
            Browse Stream
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Pending admin approval state */}
      {isPending && !isApproved && (
        <div className="flex items-start gap-4 rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/[0.08] p-6 shadow-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning)]/15 text-[var(--color-warning)]">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              Pending admin approval
            </p>
            <p className="mt-1 text-xs leading-6 text-white/50">
              Your document has been submitted and is awaiting review by our
              admin team. This typically takes 1–2 business days. You'll be
              notified once it's approved, and your dashboard will unlock
              automatically.
            </p>
          </div>
        </div>
      )}

      {/* Rejected state */}
      {isRejected && (
        <div className="flex items-start gap-4 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/[0.08] p-6 shadow-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-danger)]/15 text-[var(--color-danger)]">
            <XCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              Submission rejected
            </p>
            <p className="mt-1 text-xs leading-6 text-white/50">
              {rejectionReason ||
                "Your document didn't meet our requirements. Please re-upload a valid contract with your legal name from the last 3–6 months."}
            </p>
          </div>
        </div>
      )}

      {/* Upload card — shown unless approved or pending */}
      {!isApproved && !isPending && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10">
              <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-black text-white">
                {isRejected ? "Re-upload your contract" : "Upload your contract"}
              </h2>
              <p className="text-xs text-white/40">
                PDF, JPG or PNG · max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>

          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center transition hover:border-[var(--color-secondary)]/40 hover:bg-white/[0.04]"
            >
              <UploadCloud className="h-8 w-8 text-white/25" />
              <div>
                <p className="text-sm font-bold text-white">
                  Click to upload, or drag and drop
                </p>
                <p className="mt-1 text-xs text-white/35">
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
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {file.name}
                </p>
                <p className="text-xs text-white/35">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Remove file"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-xs font-semibold"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.3)",
                color: "#fca5a5",
              }}
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

      {/* Info footer */}
      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <ShieldCheck className="h-3.5 w-3.5 text-white/30" />
        <p className="text-center text-[11px] text-white/35">
          Your document is reviewed manually by the TRACT admin team. No
          personal contact information is shared with other users.
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import {
  AlertCircle, CheckCircle2, Clock, FileText, FolderLock,
  Info, Lock, RefreshCw, Shield, Trash2, Upload,
} from "lucide-react";

/* ── Types & data ───────────────────────────────────────── */
type FileStatus = "verified" | "review" | "pending" | "error";
interface VaultFile { id: string; name: string; size: string; status: FileStatus; uploadedAt: string }

const VAULT_DOCS = [
  { id: "survey",   title: "Property Survey",         desc: "Topographic & boundary survey from a licensed surveyor", required: true,  icon: "📐" },
  { id: "tax",      title: "Latest Property Tax Bill", desc: "Official assessment for the current or most recent tax year", required: true,  icon: "🏛️" },
  { id: "mortgage", title: "Mortgage Statement",       desc: "Current principal balance (if any outstanding mortgage)", required: false, icon: "🏦" },
];

const STATUS: Record<FileStatus, { label: string; color: string; icon: React.ReactNode }> = {
  verified: { label: "Verified",   color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",         icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  review:   { label: "In Review",  color: "bg-[var(--color-secondary)]/15 text-[#7a5d00]",                    icon: <RefreshCw    className="h-3.5 w-3.5" /> },
  pending:  { label: "Pending",    color: "bg-[var(--color-border-light)] text-[var(--color-text-muted)]",    icon: <Clock        className="h-3.5 w-3.5" /> },
  error:    { label: "Error",      color: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",            icon: <AlertCircle  className="h-3.5 w-3.5" /> },
};

const SEED_FILES: VaultFile[] = [
  { id: "f1", name: "Survey_Aspen2024.pdf", size: "2.4 MB", status: "verified", uploadedAt: "May 18, 2026" },
  { id: "f2", name: "TaxBill_2025.pdf",     size: "0.8 MB", status: "review",   uploadedAt: "May 19, 2026" },
];

/* ── Drop Zone ──────────────────────────────────────────── */
function DropZone({ docId, onUpload }: { docId: string; onUpload: (id: string, name: string) => void }) {
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onUpload(docId, f.name); }}
      className={`mt-4 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-7 transition-all ${drag ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] hover:border-[var(--color-primary)]/50"}`}
    >
      <Upload className={`h-6 w-6 ${drag ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
      <p className="text-[11px] font-bold text-[var(--color-text-muted)]">Drag & drop your file</p>
      <label className="cursor-pointer text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)] underline underline-offset-4">
        Browse Files
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(docId, f.name); }} />
      </label>
      <p className="text-[10px] text-[var(--color-text-muted)]/60">PDF, DOC, JPG · Max 20 MB</p>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function DocumentVaultPage() {
  const [files, setFiles] = useState<VaultFile[]>(SEED_FILES);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function handleUpload(docId: string, name: string) {
    const id = `f${Date.now()}`;
    setFiles(p => [...p, { id, name, size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`, status: "pending", uploadedAt: "Just now" }]);
    setUploaded(p => [...p, docId]);
    setTimeout(() => setFiles(p => p.map(f => f.id === id ? { ...f, status: "review" } : f)), 2000);
  }

  const verified = files.filter(f => f.status === "verified").length;
  const total    = 2; // survey + tax
  const pct      = Math.min(100, Math.round((verified / total) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Seller Portal</p>
          <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <FolderLock className="h-7 w-7 text-[var(--color-secondary)]" /> Document Vault
          </h1>
        </div>
        <div className="flex items-center gap-2 border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-2">
          <Lock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">AES-256 Encrypted</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Ownership Verification</p>
            <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">{verified} of {total} required documents verified</p>
          </div>
          <span className={`font-serif text-2xl font-black ${pct === 100 ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>{pct}%</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {VAULT_DOCS.map(doc => {
          const done = uploaded.includes(doc.id);
          return (
            <div key={doc.id} className={`rounded-xl border bg-white p-5 shadow-[var(--shadow-card)] transition ${done ? "border-[var(--color-primary)]/40" : "border-[var(--color-border-light)]"}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="text-2xl">{doc.icon}</span>
                  <h3 className="mt-2 text-sm font-black text-[var(--color-primary)]">{doc.title}</h3>
                  <p className="mt-1 text-xs leading-4 text-[var(--color-text-muted)]">{doc.desc}</p>
                </div>
                {doc.required && <span className="shrink-0 bg-[var(--color-danger)]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-danger)]">Required</span>}
              </div>
              {done ? (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[11px] font-bold text-[var(--color-primary)]">Uploaded — In Review</span>
                </div>
              ) : (
                <DropZone docId={doc.id} onUpload={handleUpload} />
              )}
            </div>
          );
        })}
      </div>

      {/* File table */}
      {files.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-black text-[var(--color-primary)]">Recent Uploads</h2>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Document", "Size", "Status", "Uploaded", ""].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => {
                    const cfg = STATUS[file.status];
                    return (
                      <tr key={file.id} className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-danger)]/10">
                              <FileText className="h-4 w-4 text-[var(--color-danger)]" />
                            </div>
                            <span className="text-sm font-bold text-[var(--color-text-main)]">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">{file.size}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">{file.uploadedAt}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setFiles(p => p.filter(f => f.id !== file.id))}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: Shield,       label: "ISO 27001 Certified", sub: "Information Security" },
          { icon: Lock,         label: "GDPR Compliant",      sub: "Global Data Standard" },
          { icon: CheckCircle2, label: "Biometric Logs",      sub: "MFA & Identity Tracking" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-[var(--color-border-light)] bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-secondary)]"><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-black text-[var(--color-text-main)]">{label}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit CTA */}
      <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-secondary)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">1-Hour Auto-Live</span>
            </div>
            <h3 className="mt-2 font-serif text-xl font-black">Ready to Go Live?</h3>
            <p className="mt-1 text-sm text-white/60">Submit all documents and your listing goes live within 1 hour.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {submitted ? (
              <div className="flex items-center gap-2 border border-[var(--color-secondary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                <CheckCircle2 className="h-4 w-4" /> Submitted — Checking…
              </div>
            ) : (
              <button type="button" onClick={() => setSubmitted(true)}
                className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]">
                <Upload className="h-4 w-4" /> Submit Everything
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <Info className="h-3 w-3 text-white/40" />
              <span className="text-[10px] text-white/40">All required docs must be uploaded first</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

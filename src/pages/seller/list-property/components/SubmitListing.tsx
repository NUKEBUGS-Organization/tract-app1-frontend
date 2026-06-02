import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function SuccessState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-secondary)]" />
      </div>

      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Draft Listing Created!
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
          Your property listing draft was created and property pictures were
          uploaded successfully. Upload survey and tax bill later to submit it
          for auto-live review.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-6 py-3">
        <ShieldCheck className="h-4 w-4 text-[var(--color-secondary)]" />

        <span className="text-sm font-bold text-[var(--color-primary)]">
          Draft Saved
        </span>
      </div>

      <a
        href="/document-vault"
        className="bg-[var(--color-primary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.02]"
      >
        Upload Required Documents →
      </a>
    </div>
  );
}
import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useCreateTicketMutation } from "../../services/ticketService";

const schema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  description: z
    .string()
    .min(20, "Please provide more detail (min 20 characters)")
    .max(5000),
  category: z.string().min(1, "Select a category"),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  "Account & Verification",
  "Pricing & Subscription",
  "Listings & Bids",
  "Contracts & Deals",
  "Technical Issue",
  "Other",
];

export default function SupportNewPage() {
  const navigate = useNavigate();
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (submittingRef.current || isLoading) return;
    submittingRef.current = true;
    try {
      const ticket = await createTicket({
        subject: data.subject,
        description: `[${data.category}]\n\n${data.description}`,
      }).unwrap();
      if (ticket?.id) navigate(`/support/${ticket.id}`);
    } finally {
      submittingRef.current = false;
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:shadow-sm placeholder:text-[var(--color-text-muted)]";

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <Link
        to="/support"
        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My Tickets
      </Link>

      {/* ── Form card ────────────────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        {/* Card header */}
        <div className="border-b border-[var(--color-border-light)] px-8 py-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Support
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            Open a Ticket
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Describe your issue and our team will respond within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-8">
          {/* Category */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              {...register("category")}
              className={inputCls}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-danger)]">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              {...register("subject")}
              className={inputCls}
              placeholder="Short summary of your issue"
            />
            {errors.subject && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-danger)]">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={6}
              className={`${inputCls} resize-none`}
              placeholder="What happened? Steps to reproduce help us resolve faster."
            />
            {errors.description && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-danger)]">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="border-t border-[var(--color-border-light)] pt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? "Submitting…" : "Submit Ticket"}
            </button>
            <p className="mt-3 text-center text-[11px] text-[var(--color-text-muted)]">
              Our team typically responds within 24 hours.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

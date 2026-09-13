import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <div>
        <Link
          to="/support"
          className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] underline"
        >
          Back to tickets
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
          Open a Ticket
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Describe your issue and our team will respond shortly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-3xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]"
      >
        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Category
          </label>
          <select
            {...register("category")}
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)]"
          >
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Subject
          </label>
          <input
            {...register("subject")}
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)]"
            placeholder="Short summary"
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={6}
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)]"
            placeholder="What happened? Steps to reproduce help us resolve faster."
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.description.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit ticket
        </button>
      </form>
    </div>
  );
}

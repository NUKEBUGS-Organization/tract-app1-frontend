import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Loader2,
  Send,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import {
  useCreateTicketMutation,
  type TicketPriority,
} from "../../../services/ticketService";

interface PriorityOption {
  value: TicketPriority;
  label: string;
  description: string;
  color: string;
  bg: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: "low",
    label: "Low",
    description: "General question, no urgency",
    color: "text-gray-500",
    bg: "bg-gray-50",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Something isn't working as expected",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "high",
    label: "High",
    description: "Impacting my ability to use the platform",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Critical — deal or account at risk",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function NewSupportTicketPage() {
  const navigate = useNavigate();
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const selectedPriority =
    PRIORITY_OPTIONS.find((p) => p.value === priority) ?? PRIORITY_OPTIONS[1];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (subject.trim().length < 3) {
      setError("Subject must be at least 3 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
      }).unwrap();
      navigate(`/support/tickets/${ticket._id}`);
    } catch {
      setError("Failed to submit your ticket. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <Link
        to="/support"
        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Help Center
      </Link>

      {/* ── Form card ────────────────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="mb-7 border-b border-[var(--color-border-light)] pb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Support
          </p>
          <h1 className="mt-2 font-serif text-3xl font-black text-[var(--color-primary)]">
            Open a New Ticket
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Describe your issue below and our team will respond directly in this
            thread within 24 hours.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label
              htmlFor="ticket-subject"
              className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
            >
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Cannot access my deal tracker"
              maxLength={200}
              className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm"
            />
            <p className="mt-1.5 text-right text-[10px] text-[var(--color-text-muted)]">
              {subject.length}/200
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="ticket-description"
              className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
            >
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the issue in detail — steps to reproduce, what you expected, and what actually happened…"
              className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm"
            />
          </div>

          {/* Priority – custom styled dropdown */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Priority
            </label>

            <div className="relative">
              <button
                type="button"
                id="priority-selector"
                onClick={() => setPriorityOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/40 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${selectedPriority.bg} ${selectedPriority.color}`}
                  >
                    {selectedPriority.label}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {selectedPriority.description}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--color-text-muted)] transition-transform ${priorityOpen ? "rotate-180" : ""}`}
                />
              </button>

              {priorityOpen && (
                <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-lg">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setPriority(opt.value);
                        setPriorityOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-bg-soft)] ${opt.value === priority
                        ? "bg-[var(--color-primary)]/5"
                        : ""
                        }`}
                    >
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${opt.bg} ${opt.color}`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {opt.description}
                      </span>
                      {opt.value === priority && (
                        <span className="ml-auto text-[var(--color-primary)]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-[var(--color-border-light)] pt-6">
            <button
              id="submit-ticket-btn"
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

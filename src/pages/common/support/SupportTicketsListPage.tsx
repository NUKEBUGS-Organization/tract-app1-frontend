import { useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Ticket,
  XCircle,
  Filter,
} from "lucide-react";

import {
  useGetTicketsQuery,
  type TicketStatus,
  type TicketPriority,
} from "../../../services/ticketService";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; dot: string; icon: typeof Clock }
> = {
  open: {
    label: "Open",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    bg: "bg-[var(--color-bg-soft)]",
    text: "text-[var(--color-text-muted)]",
    dot: "bg-gray-400",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    bg: "bg-[var(--color-bg-soft)]",
    text: "text-[var(--color-text-muted)]",
    dot: "bg-gray-300",
    icon: XCircle,
  },
};

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string }
> = {
  low: { label: "Low", color: "text-gray-400" },
  medium: { label: "Medium", color: "text-blue-500" },
  high: { label: "High", color: "text-orange-500" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

const FILTER_TABS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function SupportTicketsListPage() {
  const { data: tickets = [], isLoading, isError } = useGetTicketsQuery();
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("all");

  const filtered =
    activeFilter === "all"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  const counts = tickets.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4" />
              Help Center
            </Link>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Support
            </p>
            <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)] sm:text-4xl">
              My Tickets
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
              Track every question or issue you've raised with our team. We
              typically respond within&nbsp;24&nbsp;hours.
            </p>
          </div>

          <Link
            id="new-ticket-btn"
            to="/support/tickets/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-secondary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition-all hover:scale-[1.03] hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      </section>

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">
            Loading your tickets…
          </p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────── */}
      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <div>
            <p className="font-bold text-red-700">Failed to load tickets</p>
            <p className="mt-1 text-sm text-red-500">
              Please refresh the page to try again.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ── Status filter tabs ─────────────────────────── */}
          {tickets.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--color-border-light)] bg-white p-1.5 shadow-sm scrollbar-none">
              <Filter className="ml-2 mr-1 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.value === "all"
                    ? tickets.length
                    : counts[tab.value] ?? 0;
                const active = activeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    id={`filter-${tab.value}`}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
                      active
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Empty state ────────────────────────────────── */}
          {tickets.length === 0 && (
            <div className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--color-border-light)] bg-white py-24 text-center shadow-[var(--shadow-card)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary)]/8">
                <Ticket
                  className="h-10 w-10 text-[var(--color-primary)]/40"
                  strokeWidth={1.25}
                />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                  No tickets yet
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                  Have a question or ran into an issue? Open a ticket and our
                  team will follow up directly.
                </p>
              </div>
              <Link
                to="/support/tickets/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition-all hover:scale-[1.03]"
              >
                <Plus className="h-4 w-4" />
                Open First Ticket
              </Link>
            </div>
          )}

          {/* ── Filtered empty state ───────────────────────── */}
          {tickets.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border-light)] bg-white py-14 text-center">
              <MessageSquare
                className="h-10 w-10 text-[var(--color-border-light)]"
                strokeWidth={1}
              />
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                No{" "}
                {activeFilter !== "all"
                  ? activeFilter.replace("_", " ")
                  : ""}{" "}
                tickets found.
              </p>
            </div>
          )}

          {/* ── Ticket cards ───────────────────────────────── */}
          {filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((ticket) => {
                const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
                const priority =
                  PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
                const StatusIcon = status.icon;
                const replyCount = ticket.messages.length;

                return (
                  <Link
                    key={ticket._id}
                    to={`/support/tickets/${ticket._id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/20 hover:shadow-lg"
                  >
                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 transition-colors group-hover:bg-[var(--color-primary)]/12">
                      <MessageSquare
                        className="h-5 w-5 text-[var(--color-primary)]"
                        strokeWidth={1.75}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)]">
                          {ticket.subject}
                        </p>

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${status.bg} ${status.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">
                        {ticket.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        {/* Priority */}
                        <span
                          className={`text-[11px] font-black uppercase tracking-[0.12em] ${priority.color}`}
                        >
                          {priority.label} Priority
                        </span>

                        <span className="text-[var(--color-border-light)]">·</span>

                        {/* Date */}
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>

                        {replyCount > 0 && (
                          <>
                            <span className="text-[var(--color-border-light)]">
                              ·
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                              <MessageSquare className="h-3 w-3" />
                              {replyCount}{" "}
                              {replyCount === 1 ? "reply" : "replies"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

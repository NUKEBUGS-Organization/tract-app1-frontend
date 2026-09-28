import { Link } from "react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  TicketX,
} from "lucide-react";
import { useGetTicketsQuery } from "../../services/ticketService";
import { useAppSelector } from "../../redux/hooks";
import { ADMIN_ROLES } from "../../constants/roles";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    className: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    dot: "bg-[var(--color-primary)]",
    border: "border-l-[var(--color-primary)]",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--color-secondary)]/15 text-amber-700",
    dot: "bg-[var(--color-secondary)]",
    border: "border-l-[var(--color-secondary)]",
    icon: RefreshCw,
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-l-emerald-400",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    className: "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]",
    dot: "bg-gray-400",
    border: "border-l-gray-300",
    icon: TicketX,
  },
} as const;

export default function SupportListPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const isAdmin = role && ADMIN_ROLES.includes(role as never);
  const { data: tickets = [], isLoading, isError } = useGetTicketsQuery();

  return (
    <div className="space-y-6">
      {/* ── Section switcher ────────────────────────────── */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border-light)] bg-white p-1 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
          <LifeBuoy className="h-3.5 w-3.5" />
          Tickets
        </span>

        <Link
          to="/support/faq"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          FAQs
        </Link>
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                Support
              </p>
              <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
                {isAdmin ? "Support Queue" : "My Tickets"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/support/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              New Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-secondary)]" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Loading tickets…
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">
            Could not load tickets. Please retry.
          </p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-14 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-bg-soft)]">
            <MessageSquare className="h-8 w-8 text-[var(--color-text-muted)]" />
          </div>
          <h2 className="mt-5 font-serif text-xl font-black text-[var(--color-primary)]">
            No tickets yet
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Submit your first ticket and our team will respond within 24 hours.
          </p>
          <Link
            to="/support/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Open your first ticket
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            return (
              <li key={ticket.id}>
                <Link
                  to={`/support/${ticket.id}`}
                  className={`group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border-light)] border-l-4 ${cfg.border} bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:bg-slate-50/30 hover:shadow-md`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--color-primary)] transition-colors duration-200 group-hover:text-[var(--color-text-main)]">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-[var(--color-text-main)]">
                      {new Date(ticket.updatedAt).toLocaleString()}
                      {isAdmin && ticket.sourceApp
                        ? ` · ${ticket.sourceApp}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-transform duration-200 group-hover:scale-[1.03] ${cfg.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-primary)]" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
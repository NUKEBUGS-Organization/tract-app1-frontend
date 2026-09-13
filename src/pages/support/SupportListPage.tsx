import { Link } from "react-router";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useGetTicketsQuery } from "../../services/ticketService";
import { useAppSelector } from "../../redux/hooks";
import { ADMIN_ROLES } from "../../constants/roles";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    className: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--color-secondary)]/15 text-[var(--color-primary)]",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    className: "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    className: "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]",
    icon: CheckCircle2,
  },
} as const;

export default function SupportListPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const isAdmin = role && ADMIN_ROLES.includes(role as never);
  const { data: tickets = [], isLoading, isError } = useGetTicketsQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Support
          </p>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
            {isAdmin ? "Support Queue" : "My Tickets"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/support/faq"
            className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]"
          >
            FAQ
          </Link>
          <Link
            to="/support/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary-dark)]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-secondary)]" />
        </div>
      ) : isError ? (
        <p className="text-sm text-[var(--color-danger)]">
          Could not load tickets. Please retry.
        </p>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <MessageSquare className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            No tickets yet.
          </p>
          <Link
            to="/support/new"
            className="mt-4 inline-block text-sm font-bold text-[var(--color-primary)] underline"
          >
            Open your first ticket
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => {
            const cfg =
              STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            const Icon = cfg.icon;
            return (
              <li key={ticket.id}>
                <Link
                  to={`/support/${ticket.id}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--color-secondary)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--color-primary)]">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {new Date(ticket.updatedAt).toLocaleString()}
                      {isAdmin && ticket.sourceApp
                        ? ` · ${ticket.sourceApp}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.className}`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

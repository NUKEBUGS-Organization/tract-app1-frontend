import { useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Loader2,
  Send,
  ShieldCheck,
  UserCircle2,
  ChevronDown,
  Info,
} from "lucide-react";

import {
  useClaimTicketMutation,
  useGetTicketByIdQuery,
  useUpdateTicketMutation,
  type TicketStatus,
  type TicketPriority,
} from "../../../services/ticketService";
import { useAppSelector } from "../../../redux/hooks";
import {
  normalizeRole,
  ADMIN_ROLES,
  isAllowedRole,
} from "../../../constants/roles";

const STATUSES: { value: TicketStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "text-emerald-600" },
  { value: "in_progress", label: "In Progress", color: "text-amber-600" },
  { value: "resolved", label: "Resolved", color: "text-gray-500" },
  { value: "closed", label: "Closed", color: "text-gray-400" },
];

const STATUS_BADGE: Record<
  TicketStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  open: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Open",
  },
  in_progress: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "In Progress",
  },
  resolved: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
    label: "Resolved",
  },
  closed: {
    bg: "bg-gray-100",
    text: "text-gray-400",
    dot: "bg-gray-300",
    label: "Closed",
  },
};

const PRIORITY_LABEL: Record<TicketPriority, { label: string; color: string }> =
  {
    low: { label: "Low Priority", color: "text-gray-400" },
    medium: { label: "Medium Priority", color: "text-blue-500" },
    high: { label: "High Priority", color: "text-orange-500" },
    urgent: { label: "🚨 Urgent", color: "text-red-600" },
  };

export default function SupportTicketDetailPage() {
  const { id = "" } = useParams();
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?._id || (user as any)?.id || "";
  const isAdmin = isAllowedRole(normalizeRole(user?.role), ADMIN_ROLES);

  const { data: ticket, isLoading } = useGetTicketByIdQuery(id, { skip: !id });
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [claimTicket, { isLoading: isClaiming }] = useClaimTicketMutation();

  const [reply, setReply] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "">("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-28">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Loading ticket…
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Info className="h-10 w-10 text-[var(--color-text-muted)]" />
        <p className="font-bold text-[var(--color-primary)]">
          Ticket not found
        </p>
        <Link
          to="/support/tickets"
          className="text-sm text-[var(--color-secondary)] underline"
        >
          Back to My Tickets
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[ticket.status] ?? STATUS_BADGE.open;
  const priorityInfo =
    PRIORITY_LABEL[ticket.priority] ?? PRIORITY_LABEL.medium;

  const sendReply = async () => {
    if (!reply.trim()) return;
    await updateTicket({ id, body: { reply: reply.trim() } }).unwrap();
    setReply("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      void sendReply();
    }
  };

  const applyStatus = async () => {
    if (!selectedStatus) return;
    await updateTicket({ id, body: { status: selectedStatus } }).unwrap();
    setStatusMenuOpen(false);
    setSelectedStatus("");
  };

  const handleClaim = async () => {
    await claimTicket(id).unwrap();
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────── */}
      <Link
        to="/support/tickets"
        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        My Tickets
      </Link>

      {/* ── Ticket header card ──────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Support Ticket
            </p>
            <h1 className="mt-1.5 font-serif text-2xl font-black text-[var(--color-primary)] sm:text-3xl">
              {ticket.subject}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {/* Status */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${badge.bg} ${badge.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                />
                {badge.label}
              </span>

              {/* Priority */}
              <span
                className={`text-[11px] font-black uppercase tracking-[0.12em] ${priorityInfo.color}`}
              >
                {priorityInfo.label}
              </span>

              {/* Assigned */}
              {ticket.assignedTo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-primary)]">
                  <ShieldCheck className="h-3 w-3" />
                  Assigned
                </span>
              )}
            </div>
          </div>

          {/* Created date */}
          <p className="shrink-0 text-right text-[11px] text-[var(--color-text-muted)]">
            Opened{" "}
            {new Date(ticket.createdAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Description */}
        <div className="mt-5 rounded-2xl bg-[var(--color-bg-soft)] p-4">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Original Request
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-main)]">
            {ticket.description}
          </p>
        </div>
      </section>

      {/* ── Admin Controls ──────────────────────────────── */}
      {isAdmin && (
        <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Admin Controls
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Claim button */}
            <button
              id="claim-ticket-btn"
              type="button"
              onClick={handleClaim}
              disabled={isClaiming || !!ticket.assignedTo}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)] shadow-sm transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isClaiming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {claimSuccess
                ? "Claimed!"
                : ticket.assignedTo
                  ? "Already Assigned"
                  : "Claim Ticket"}
            </button>

            {/* Status selector */}
            <div className="relative">
              <button
                id="status-selector-btn"
                type="button"
                onClick={() => setStatusMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-main)] transition hover:border-[var(--color-primary)]/30"
              >
                {selectedStatus
                  ? STATUSES.find((s) => s.value === selectedStatus)?.label
                  : "Set Status…"}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[var(--color-text-muted)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {statusMenuOpen && (
                <div className="absolute z-20 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-lg">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(s.value);
                        setStatusMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-[var(--color-bg-soft)] ${s.color} ${selectedStatus === s.value ? "font-black" : "font-semibold"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStatus && (
              <button
                id="apply-status-btn"
                type="button"
                onClick={applyStatus}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Apply
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Conversation thread ─────────────────────────── */}
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--color-border-light)] px-7 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Conversation · {ticket.messages.length}{" "}
            {ticket.messages.length === 1 ? "message" : "messages"}
          </p>
        </div>

        <div className="space-y-1 px-7 py-6">
          {ticket.messages.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No messages yet. Start the conversation below.
            </p>
          )}

          {ticket.messages.map((m, i) => {
            const mine = m.senderId === currentUserId;
            const isAdminMsg = ADMIN_ROLES.includes(
              normalizeRole(m.senderRole)
            );

            return (
              <div
                key={`${m.createdAt}-${i}`}
                className={`flex gap-3 py-3 ${mine ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                    isAdminMsg
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-secondary)]"
                  }`}
                >
                  {isAdminMsg ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <UserCircle2 className="h-4 w-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                      {isAdminMsg
                        ? "Support Team"
                        : mine
                          ? "You"
                          : m.senderRole.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      mine
                        ? "bg-[var(--color-primary)] text-white"
                        : isAdminMsg
                          ? "border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/8 text-[var(--color-text-main)]"
                          : "border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </section>

      {/* ── Reply box ───────────────────────────────────── */}
      {ticket.status !== "closed" && (
        <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-7 shadow-[var(--shadow-card)]">
          <label
            htmlFor="reply-textarea"
            className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
          >
            Reply
          </label>
          <textarea
            id="reply-textarea"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Write your reply… (⌘+Enter to send)"
            className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              ⌘ + Enter to send
            </p>
            <button
              id="send-reply-btn"
              type="button"
              onClick={sendReply}
              disabled={isUpdating || !reply.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isUpdating ? "Sending…" : "Send Reply"}
            </button>
          </div>
        </section>
      )}

      {ticket.status === "closed" && (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">
            This ticket is closed. Open a new ticket if you need further
            assistance.
          </p>
          <Link
            to="/support/tickets/new"
            className="mt-3 inline-block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]"
          >
            Open New Ticket →
          </Link>
        </div>
      )}
    </div>
  );
}

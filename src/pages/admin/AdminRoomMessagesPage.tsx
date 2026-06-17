import { useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  MessageSquare,
  UserRound,
  UsersRound,
} from "lucide-react";

import { useGetAdminRoomMessagesQuery } from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiPagination,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMessagesFromResponse(response: any) {
  if (!response) return [];
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.messages)) return response.messages;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.messages)) return response.data.messages;
  return [];
}

function getMessageText(message: any) {
  return message?.content || message?.message || message?.text || message?.body || "-";
}

function getSenderLabel(message: any, room: any) {
  const senderId =
    typeof message?.sender_id === "string"
      ? message.sender_id
      : message?.sender_id?._id || message?.sender_id?.id;

  const sellerId =
    typeof room?.seller_id === "string"
      ? room.seller_id
      : room?.seller_id?._id || room?.seller_id?.id;

  const buyerId =
    typeof room?.buyer_id === "string"
      ? room.buyer_id
      : room?.buyer_id?._id || room?.buyer_id?.id;

  if (senderId && sellerId && senderId === sellerId) {
    return `Seller · ${getPersonName(message.sender_id)}`;
  }

  if (senderId && buyerId && senderId === buyerId) {
    return `Buyer · ${getPersonName(message.sender_id)}`;
  }

  return getPersonName(message.sender_id);
}

function isSeller(message: any, room: any) {
  const senderId =
    typeof message?.sender_id === "string"
      ? message.sender_id
      : message?.sender_id?._id || message?.sender_id?.id;

  const sellerId =
    typeof room?.seller_id === "string"
      ? room.seller_id
      : room?.seller_id?._id || room?.seller_id?.id;

  return Boolean(senderId && sellerId && senderId === sellerId);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
        accent
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          accent
            ? "bg-[var(--color-primary)]/12 text-[var(--color-primary)]"
            : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]/60"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-bold ${
            accent ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminRoomMessagesPage() {
  const { roomId = "" } = useParams();
  const location = useLocation();

  const state = location.state as any;
  const room = state?.room ?? null;
  const listingName = state?.listingName ?? "Listing";

  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminRoomMessagesQuery(
    { roomId, page, limit: 50 },
    { skip: !roomId }
  );

  const messagesFromApi = getMessagesFromResponse(data);
  const messages = [...messagesFromApi].reverse();
  const pagination = getApiPagination(data);

  const sellerName = room ? getPersonName(room.seller_id) : "-";
  const buyerName = room ? getPersonName(room.buyer_id) : "-";

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Room Messages
            </p>
            <h1 className="mt-1.5 font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              {listingName}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] font-mono">
              Room: {roomId}
            </p>
          </div>

          {/* Message count chip */}
          <div className="mt-2 shrink-0 md:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
              <MessageSquare className="h-3.5 w-3.5" />
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-4">
          <StatCard label="Seller" value={sellerName} icon={UserRound} />
          <StatCard label="Buyer" value={buyerName} icon={UsersRound} />
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">

        {/* Section header */}
        <div className="mb-4 flex items-center gap-2 pb-3 border-b border-[var(--color-border-light)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <h2 className="font-serif text-base font-black text-[var(--color-primary)]">
            Conversation
          </h2>
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
        </div>

        {isLoading ? (
          <Loader label="Loading messages..." />
        ) : isError ? (
          <div className="text-sm font-semibold text-[var(--color-danger)]">
            Failed to load room messages.
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]/40">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">No messages yet</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              No messages have been sent in this room.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message: any, index: number) => {
              const senderIsSeller = isSeller(message, room);
              return (
                <div
                  key={getMongoId(message) || index}
                  className={`flex gap-3 ${senderIsSeller ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Avatar dot */}
                  <div
                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${
                      senderIsSeller
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-secondary)]"
                    }`}
                  >
                    {senderIsSeller ? "S" : "B"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] space-y-1 ${
                      senderIsSeller ? "items-start" : "items-end"
                    } flex flex-col`}
                  >
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.14em] ${
                          senderIsSeller
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-secondary)]"
                        }`}
                      >
                        {getSenderLabel(message, room)}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        senderIsSeller
                          ? "rounded-tl-sm bg-[var(--color-bg-soft)] text-[var(--color-text-main)]"
                          : "rounded-tr-sm bg-[var(--color-primary)]/8 text-[var(--color-text-main)]"
                      }`}
                    >
                      {getMessageText(message)}
                    </div>

                    {message.flagged && (
                      <div className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]">
                        ⚑ Flagged: {message.flag_reason || "No reason provided"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

    </div>
  );
}

export default AdminRoomMessagesPage;
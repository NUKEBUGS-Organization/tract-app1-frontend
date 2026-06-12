import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import { useGetChatRoomsQuery } from "../../services/chatService";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useAppSelector } from "../../redux/hooks";

function getId(item: any) {
  return item?._id || item?.id || "";
}

function getCurrentUserId(user: any) {
  return user?._id || user?.id || user?.user_id || user?.sub || "";
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string) {
  if (!status) return "Active";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getOtherParticipant(room: any, currentUserId: string) {
  const sellerId = getId(room?.seller_id);
  const buyerId = getId(room?.buyer_id);

  if (sellerId === currentUserId) return room?.buyer_id;
  if (buyerId === currentUserId) return room?.seller_id;

  return room?.buyer_id || room?.seller_id;
}

function getDealLabel(room: any) {
  const listing = room?.deal_id?.listing_id;
  const address = listing?.address;

  if (address) return address;

  return `Deal ${getId(room?.deal_id).slice(-6)}`;
}

export default function ChatRoomsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = getCurrentUserId(user);

  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    isFetching: isFetchingRooms,
    refetch: refetchRooms,
  } = useGetChatRoomsQuery();

  const {
    data: deals = [],
    isLoading: isLoadingDeals,
    isFetching: isFetchingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery();

  const isBusy =
    isLoadingRooms || isFetchingRooms || isLoadingDeals || isFetchingDeals;

  async function handleRefresh() {
    await Promise.all([refetchRooms(), refetchDeals()]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Messages
          </p>

          <h1 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <MessageCircle className="h-7 w-7 text-[var(--color-secondary)]" />
            Chat Rooms
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Chat rooms appear automatically after a deal is created from a fully
            signed contract.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isBusy}
          className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isBusy && (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
            Loading chat rooms...
          </p>
        </div>
      )}

      {!isBusy && rooms.length === 0 && (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-[var(--color-secondary)]" />

            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                No chat rooms yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                A chat room will be created automatically when both seller and
                buyer have signed the contract and the deal is created.
              </p>

              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Active deals found: {deals.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isBusy && rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {rooms.map((room: any) => {
            const roomId = getId(room);
            const otherUser = getOtherParticipant(room, currentUserId);

            return (
              <Link
                key={roomId}
                to={`/chat/${roomId}`}
                className="block rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)]"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      {getDealLabel(room)}
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-black text-[var(--color-primary)]">
                      {otherUser?.full_name || otherUser?.email || "Deal Chat"}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      Last activity: {formatDateTime(room?.last_message_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {room?.is_locked ? "Locked" : "Open"}
                    </span>

                    <span className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      {formatStatus(room?.deal_id?.status)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
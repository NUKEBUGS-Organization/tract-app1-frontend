import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";

import {
  useGetChatRoomByIdQuery,
  useGetChatRoomMessagesQuery,
  useGetChatRoomsQuery,
  useMarkChatRoomAsReadMutation,
} from "../../services/chatService";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useAppSelector } from "../../redux/hooks";
import { getChatSocket } from "../../utils/chatSocket";

function getId(item: any) {
  if (!item) return "";

  if (typeof item === "string") return item;

  return item?._id || item?.id || "";
}

function getCurrentUserId(user: any) {
  return user?._id || user?.id || user?.user_id || user?.sub || "";
}

function getSenderId(message: any) {
  return getId(message?.sender_id) || message?.sender_id || "";
}

function getSenderName(message: any, currentUserId: string) {
  if (getSenderId(message) === currentUserId) return "You";

  return message?.sender_id?.full_name || message?.sender_id?.email || "User";
}

function formatDateTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string) {
  if (!status) return "-";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(value: any) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "-";

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getOtherParticipant(room: any, currentUserId: string) {
  const sellerId = getId(room?.seller_id);
  const buyerId = getId(room?.buyer_id);

  if (sellerId === currentUserId) return room?.buyer_id;
  if (buyerId === currentUserId) return room?.seller_id;

  return room?.buyer_id || room?.seller_id;
}

function getListingLabel(listing: any) {
  if (!listing || typeof listing === "string") {
    return "Listing details unavailable";
  }

  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getContractLabel(contract: any) {
  if (!contract) return "-";

  if (typeof contract === "string") return contract;

  return contract?._id || contract?.id || "-";
}

function getRoomDealId(room: any) {
  return getId(room?.deal_id) || room?.deal_id || "";
}

export default function ChatRoomPage() {
  const { roomId = "" } = useParams();

  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = getCurrentUserId(user);

  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    data: room,
    isLoading: isLoadingRoom,
    isFetching: isFetchingRoom,
    refetch: refetchRoom,
  } = useGetChatRoomByIdQuery(roomId, {
    skip: !roomId,
  });

  const {
    data: fetchedMessages = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    refetch: refetchMessages,
  } = useGetChatRoomMessagesQuery(roomId, {
    skip: !roomId,
  });

  const {
    data: chatRooms = [],
    isLoading: isLoadingRooms,
    isFetching: isFetchingRooms,
    refetch: refetchRooms,
  } = useGetChatRoomsQuery();

  const {
    data: myDeals = [],
    isLoading: isLoadingDeals,
    isFetching: isFetchingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery();

  const [markChatRoomAsRead] = useMarkChatRoomAsReadMutation();

  const roomFromList = useMemo(() => {
    if (!Array.isArray(chatRooms) || !roomId) return null;

    return chatRooms.find((item: any) => getId(item) === roomId) || null;
  }, [chatRooms, roomId]);

  const displayRoom = roomFromList || room;

  const displayDealId = getRoomDealId(displayRoom);

  const dealFromList = useMemo(() => {
    if (!Array.isArray(myDeals) || !displayDealId) return null;

    return myDeals.find((deal: any) => getId(deal) === displayDealId) || null;
  }, [myDeals, displayDealId]);

  const displayListing =
    dealFromList?.listing_id || displayRoom?.deal_id?.listing_id;

  const displayContract =
    dealFromList?.contract_id || displayRoom?.deal_id?.contract_id;

  const displayOtherUser = useMemo(
    () => getOtherParticipant(displayRoom, currentUserId),
    [displayRoom, currentUserId]
  );

  const isBusy =
    isLoadingRoom ||
    isFetchingRoom ||
    isLoadingMessages ||
    isFetchingMessages ||
    isLoadingRooms ||
    isFetchingRooms ||
    isLoadingDeals ||
    isFetchingDeals;

  useEffect(() => {
    setMessages(Array.isArray(fetchedMessages) ? fetchedMessages : []);
  }, [fetchedMessages]);

  useEffect(() => {
    if (!roomId) return;

    markChatRoomAsRead(roomId).catch(() => {});
  }, [roomId, markChatRoomAsRead]);

  useEffect(() => {
    if (!roomId) return;

    const socket = getChatSocket();

    socket.emit("join-room", {
      roomId,
    });

    function handleNewMessage(message: any) {
      const messageRoomId = getId(message?.room_id) || message?.room_id;

      if (messageRoomId && messageRoomId !== roomId) return;

      setMessages((previousMessages) => {
        const messageId = getId(message);

        if (
          messageId &&
          previousMessages.some((item) => getId(item) === messageId)
        ) {
          return previousMessages;
        }

        return [...previousMessages, message];
      });

      markChatRoomAsRead(roomId).catch(() => {});
    }

    function handleTyping(payload: any) {
      if (!payload?.userId || payload.userId === currentUserId) return;

      setTypingUserId(payload.userId);

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = window.setTimeout(() => {
        setTypingUserId(null);
      }, 1800);
    }

    function handleMessageRead(updatedMessage: any) {
      const updatedMessageId = getId(updatedMessage);

      if (!updatedMessageId) return;

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          getId(message) === updatedMessageId
            ? {
                ...message,
                ...updatedMessage,
              }
            : message
        )
      );
    }

    socket.on("new-message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("message-read", handleMessageRead);

    return () => {
      socket.emit("leave-room", {
        roomId,
      });

      socket.off("new-message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("message-read", handleMessageRead);
    };
  }, [roomId, currentUserId, markChatRoomAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);

  async function handleRefresh() {
    setApiError(null);

    await Promise.all([
      refetchRoom(),
      refetchMessages(),
      refetchRooms(),
      refetchDeals(),
    ]);
  }

  function handleTyping() {
    if (!roomId || !currentUserId) return;

    const socket = getChatSocket();

    socket.emit("typing", {
      roomId,
      userId: currentUserId,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) return;

    if (!currentUserId) {
      setApiError("Unable to identify current user. Please login again.");
      return;
    }

    setApiError(null);

    const socket = getChatSocket();

    socket.emit(
      "send-message",
      {
        roomId,
        senderId: currentUserId,
        content: trimmedMessage,
      },
      (response: any) => {
        if (response?.message || response?.error) {
          setApiError(response?.message || response?.error);
        }
      }
    );

    setMessageText("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>

          <h1 className="mt-3 flex items-center gap-3 font-serif text-3xl font-black text-[var(--color-primary)]">
            <MessageCircle className="h-7 w-7 text-[var(--color-secondary)]" />
            Chat with{" "}
            {displayOtherUser?.full_name ||
              displayOtherUser?.email ||
              "Deal Partner"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            For listing:{" "}
            <span className="font-bold text-[var(--color-primary)]">
              {getListingLabel(displayListing)}
            </span>
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
            Messages are stored permanently and monitored for contact-sharing
            violations.
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

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {apiError}
        </div>
      )}

      {displayRoom?.is_locked && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
          This chat room is locked. You can view messages but cannot send new
          messages.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Listing
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
            {getListingLabel(displayListing)}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Chat Partner
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {displayOtherUser?.full_name ||
                  displayOtherUser?.email ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Deal Status
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {formatStatus(dealFromList?.status || displayRoom?.deal_id?.status)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Contract
              </p>

              <p className="mt-1 break-all text-xs font-bold text-[var(--color-text-muted)]">
                {getContractLabel(displayContract)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Market Price
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {formatMoney(displayListing?.market_price)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Chat Status
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {displayRoom?.is_locked ? "Locked" : "Open"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Room ID
              </p>

              <p className="mt-1 break-all text-xs font-bold text-[var(--color-text-muted)]">
                {roomId}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[520px] overflow-y-auto bg-[var(--color-bg-soft)] p-5">
          {isBusy && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
          )}

          {!isBusy && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-center">
                <AlertTriangle className="mx-auto h-7 w-7 text-[var(--color-secondary)]" />

                <h2 className="mt-3 font-serif text-xl font-black text-[var(--color-primary)]">
                  No messages yet
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Start the conversation after the deal is secured.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message: any) => {
              const messageId = getId(message);
              const isOwnMessage = getSenderId(message) === currentUserId;

              return (
                <div
                  key={messageId || `${message?.createdAt}-${message?.content}`}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl border p-4 shadow-sm ${
                      isOwnMessage
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border-light)] bg-white text-[var(--color-text-main)]"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                          isOwnMessage
                            ? "text-white/70"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {getSenderName(message, currentUserId)}
                      </span>

                      {message?.is_read && isOwnMessage && (
                        <CheckCheck className="h-4 w-4" />
                      )}
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message?.content}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`text-[10px] font-semibold ${
                          isOwnMessage
                            ? "text-white/70"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {formatDateTime(message?.createdAt)}
                      </span>

                      {message?.flagged && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-700">
                          <ShieldAlert className="h-3 w-3" />
                          {message?.flag_reason || "Flagged"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {typingUserId && (
          <div className="border-t border-[var(--color-border-light)] bg-white px-5 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
            Other user is typing...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-[var(--color-border-light)] bg-white p-4 md:flex-row"
        >
          <textarea
            value={messageText}
            onChange={(event) => {
              setMessageText(event.target.value);
              handleTyping();
            }}
            disabled={displayRoom?.is_locked}
            placeholder="Write a message..."
            rows={2}
            className="min-h-[52px] flex-1 resize-none border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-bg-soft)]"
          />

          <button
            type="submit"
            disabled={!messageText.trim() || displayRoom?.is_locked}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
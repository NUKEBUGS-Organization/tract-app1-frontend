import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  Building2,
  MessageSquare,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useGetAdminChatRoomsQuery,
  useGetAdminDealsQuery,
  useGetAdminRoomMessagesQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiList,
  getApiPagination,
  getListingTitle,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

type AdminPerson = {
  _id: string;
  email?: string;
  full_name?: string;
};

type AdminListing = {
  _id: string;
  title?: string;
  address?: string;
  city?: string;
  state_code?: string;
  zip_code?: string;
};

type AdminDeal = {
  _id: string;
  listing_id?: AdminListing | string;
};

type AdminRoom = {
  _id: string;
  deal_id?: string | AdminDeal;
  seller_id?: string | AdminPerson;
  buyer_id?: string | AdminPerson;
  is_active?: boolean;
  is_locked?: boolean;
  last_message_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdminRoomMessage = {
  _id: string;
  room_id?: string;
  sender_id: string | AdminPerson;
  content: string;
  type?: string;
  flagged?: boolean;
  flag_reason?: string;
  createdAt: string;
};

function getPersonId(value: string | AdminPerson | undefined | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}



function getListingFromDeal(deal: AdminDeal | undefined) {
  if (!deal) return null;

  const listing = deal.listing_id;

  if (!listing || typeof listing === "string") {
    return null;
  }

  return listing;
}

function getListingDisplayName(listing: AdminListing | null) {
  if (!listing) return "Listing";

  return (
    listing.address ||
    getListingTitle(listing) ||
    "Listing"
  );
}

function getRoomListingName(
  room: AdminRoom | null,
  dealMap: Record<string, AdminDeal>
) {
  const roomDeal = room?.deal_id;

  if (!roomDeal) return "Listing";

  // Case 1: room.deal_id is already populated object from rooms API
  if (typeof roomDeal === "object") {
    const listingFromRoomDeal = getListingFromDeal(roomDeal);

    if (listingFromRoomDeal) {
      return getListingDisplayName(listingFromRoomDeal);
    }

    const dealId = roomDeal._id;
    const matchedDeal = dealMap[dealId];

    if (matchedDeal) {
      return getListingDisplayName(getListingFromDeal(matchedDeal));
    }

    return "Listing";
  }

  // Case 2: room.deal_id is only string from flagged API
  const matchedDeal = dealMap[roomDeal];

  if (matchedDeal) {
    return getListingDisplayName(getListingFromDeal(matchedDeal));
  }

  return "Listing";
}

function getMessageText(message: AdminRoomMessage) {
  return message.content || "-";
}

function getSenderId(message: AdminRoomMessage) {
  return getPersonId(message.sender_id);
}

function getSenderLabel(message: AdminRoomMessage, room: AdminRoom | null) {
  const senderId = getSenderId(message);
  const sellerId = getPersonId(room?.seller_id);
  const buyerId = getPersonId(room?.buyer_id);

  if (senderId && sellerId && senderId === sellerId) {
    return `Seller · ${getPersonName(message.sender_id)}`;
  }

  if (senderId && buyerId && senderId === buyerId) {
    return `Buyer · ${getPersonName(message.sender_id)}`;
  }

  return getPersonName(message.sender_id);
}

function isSellerMessage(message: AdminRoomMessage, room: AdminRoom | null) {
  const senderId = getSenderId(message);
  const sellerId = getPersonId(room?.seller_id);

  return Boolean(senderId && sellerId && senderId === sellerId);
}

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
            accent
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-main)]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function AdminRoomMessagesPage() {
  const { roomId = "" } = useParams();
  const location = useLocation();

  const state = location.state as
    | {
        room?: AdminRoom;
        listingName?: string;
      }
    | null;

  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
  } = useGetAdminRoomMessagesQuery(
    {
      roomId,
      page,
      limit: 50,
    },
    {
      skip: !roomId,
    }
  );

  const {
    data: roomsResponse,
    isLoading: isRoomsLoading,
  } = useGetAdminChatRoomsQuery({
    page: 1,
    limit: 500,
  });

  const {
    data: dealsResponse,
    isLoading: isDealsLoading,
  } = useGetAdminDealsQuery({
    page: 1,
    limit: 500,
  });

  const rooms = getApiList(roomsResponse) as AdminRoom[];
  const deals = getApiList(dealsResponse) as AdminDeal[];

  const roomMap = useMemo(() => {
    return rooms.reduce((map: Record<string, AdminRoom>, room) => {
      if (room._id) {
        map[room._id] = room;
      }

      return map;
    }, {});
  }, [rooms]);

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, AdminDeal>, deal) => {
      if (deal._id) {
        map[deal._id] = deal;
      }

      return map;
    }, {});
  }, [deals]);

  const room = state?.room || roomMap[roomId] || null;
  const listingName = getRoomListingName(room, dealMap);

  const messagesFromApi = getApiList(data) as AdminRoomMessage[];
  const messages = [...messagesFromApi].reverse();
  const pagination = getApiPagination(data);

  const sellerName = room ? getPersonName(room.seller_id) : "-";
  const buyerName = room ? getPersonName(room.buyer_id) : "-";

  const isContextLoading = isRoomsLoading || isDealsLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Admin · Room Messages
            </p>

            <h1 className="mt-1.5 break-words font-serif text-2xl font-black leading-tight text-[var(--color-primary)] md:text-3xl">
              {isContextLoading && listingName === "-"
                ? "Loading listing..."
                : listingName}
            </h1>

            <p className="mt-1 break-all font-mono text-xs text-[var(--color-text-muted)]">
              Room: {roomId}
            </p>
          </div>

          <div className="mt-2 shrink-0 md:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-soft)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
              <MessageSquare className="h-3.5 w-3.5" />
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-3">
          <StatCard
            label="Listing"
            value={listingName}
            icon={Building2}
            accent
          />

          <StatCard
            label="Seller"
            value={sellerName}
            icon={UserRound}
          />

          <StatCard
            label="Buyer"
            value={buyerName}
            icon={UsersRound}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2 border-b border-[var(--color-border-light)] pb-3">
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

            <p className="text-sm font-semibold text-[var(--color-text-muted)]">
              No messages yet
            </p>

            <p className="text-xs text-[var(--color-text-muted)]">
              No messages have been sent in this room.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const senderIsSeller = isSellerMessage(message, room);

              return (
                <div
                  key={message._id || index}
                  className={`flex gap-3 ${
                    senderIsSeller ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${
                      senderIsSeller
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-secondary)]"
                    }`}
                  >
                    {senderIsSeller ? "S" : "B"}
                  </div>

                  <div
                    className={`flex max-w-[75%] flex-col space-y-1 ${
                      senderIsSeller ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
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
                        ⚑ Flagged:{" "}
                        {message.flag_reason || "No reason provided"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            disabled={page >= (pagination.totalPages || 1)}
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
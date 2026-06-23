import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock3,
  FilterX,
  LockKeyhole,
  Mail,
  MessageSquare,
  Search,
  UnlockKeyhole,
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
import StatusBadge from "../../components/common/StatusBadge";
import {
  formatDateTime,
  getApiList,
  getApiPagination,
  getListingTitle,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

type AdminPerson = {
  _id?: string;
  id?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  _doc?: any;
};

type AdminListing = {
  _id?: string;
  id?: string;
  title?: string;
  address?: string;
  property_address?: string;
  street_address?: string;
  city?: string;
  state_code?: string;
  state?: string;
  zip_code?: string;
  zipCode?: string;
  _doc?: any;
};

type AdminDeal = {
  _id?: string;
  id?: string;
  listing_id?: AdminListing | string;
  property_id?: AdminListing | string;
  _doc?: any;
};

type AdminRoom = {
  _id?: string;
  id?: string;
  deal_id?: string | AdminDeal;
  seller_id?: string | AdminPerson;
  buyer_id?: string | AdminPerson;
  is_active?: boolean;
  is_locked?: boolean;
  last_message_at?: string;
  createdAt?: string;
  updatedAt?: string;
  _doc?: any;
};

type AdminRoomMessage = {
  _id?: string;
  id?: string;
  room_id?: string;
  sender_id: string | AdminPerson;
  content: string;
  type?: string;
  flagged?: boolean;
  flag_reason?: string;
  createdAt: string;
  _doc?: any;
};

function getDoc(value: any) {
  return value?._doc ?? value;
}

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || doc?.id || "";
}

function formatLabel(value: any) {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getEmail(value: any) {
  const doc = getDoc(value);

  return doc?.email || "-";
}

function getPersonId(value: string | AdminPerson | undefined | null) {
  return getId(value);
}

function getPersonRole(value: any) {
  const doc = getDoc(value);

  return doc?.role || "-";
}

function getRoomId(room: any) {
  return getId(room);
}

function getDealId(deal: any) {
  return getId(deal);
}


function getListingFromDeal(deal: AdminDeal | undefined | null) {
  if (!deal) return null;

  const dealDoc = getDoc(deal);
  const listing = dealDoc?.listing_id || dealDoc?.property_id;

  if (!listing || typeof listing === "string") return null;

  return getDoc(listing);
}

function getListingDisplayName(listing: AdminListing | null) {
  if (!listing) return "Linked listing unavailable";

  const doc = getDoc(listing);

  return (
    doc?.address ||
    doc?.property_address ||
    doc?.street_address ||
    getListingTitle(doc) ||
    doc?.title ||
    "Linked listing unavailable"
  );
}

function getListingAddressMeta(listing: AdminListing | null) {
  if (!listing) return "";

  const doc = getDoc(listing);

  const parts = [
    doc?.city,
    doc?.state_code || doc?.state,
    doc?.zip_code || doc?.zipCode,
  ].filter(Boolean);

  return parts.join(", ");
}

function getRoomListing(
  room: AdminRoom | null,
  dealMap: Record<string, AdminDeal>
) {
  const roomDoc = getDoc(room);
  const roomDeal = roomDoc?.deal_id;

  if (!roomDeal) return null;

  if (typeof roomDeal === "object") {
    const listingFromRoomDeal = getListingFromDeal(roomDeal);

    if (listingFromRoomDeal) return listingFromRoomDeal;

    const matchedDeal = dealMap[getDealId(roomDeal)];

    return getListingFromDeal(matchedDeal);
  }

  const matchedDeal = dealMap[roomDeal];

  return getListingFromDeal(matchedDeal);
}

function getMessageText(message: AdminRoomMessage) {
  const doc = getDoc(message);

  return doc?.content || "-";
}

function getSenderId(message: AdminRoomMessage) {
  const doc = getDoc(message);

  return getPersonId(doc?.sender_id);
}

function getSenderKind(message: AdminRoomMessage, room: AdminRoom | null) {
  const roomDoc = getDoc(room);
  const senderId = getSenderId(message);
  const sellerId = getPersonId(roomDoc?.seller_id);
  const buyerId = getPersonId(roomDoc?.buyer_id);

  if (senderId && sellerId && senderId === sellerId) return "seller";
  if (senderId && buyerId && senderId === buyerId) return "buyer";

  return "unknown";
}

function getSenderLabel(message: AdminRoomMessage, room: AdminRoom | null) {
  const doc = getDoc(message);
  const kind = getSenderKind(message, room);
  const name = getPersonName(getDoc(doc?.sender_id));

  if (kind === "seller") return `Seller · ${name}`;
  if (kind === "buyer") return `Buyer · ${name}`;

  return name;
}

function getSenderInitial(message: AdminRoomMessage, room: AdminRoom | null) {
  const kind = getSenderKind(message, room);

  if (kind === "seller") return "S";
  if (kind === "buyer") return "B";

  return "U";
}

function getRoomStatus(room: AdminRoom | null) {
  const doc = getDoc(room);

  if (!doc) return "unknown";
  if (doc?.is_locked) return "locked";
  if (doc?.is_active === false) return "inactive";

  return "active";
}

function DetailTile({
  label,
  value,
  icon,
  featured = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  featured?: boolean;
}) {
  const Icon = icon;

  return (
    <div
      className={`group min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-secondary)]/40 hover:shadow-sm ${
        featured
          ? "border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:bg-[var(--color-bg-soft)]/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]/60" />

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <p
        className={`mt-1.5 truncate text-sm font-black leading-6 ${
          featured
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-text-main)]"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function ParticipantCard({
  title,
  person,
  icon,
}: {
  title: string;
  person: any;
  icon: React.ElementType;
}) {
  const Icon = icon;
  const personDoc = getDoc(person);
  const name = getPersonName(personDoc);
  const email = getEmail(personDoc);
  const role = getPersonRole(personDoc);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {title}
          </p>

          <h3 className="mt-1 break-words text-base font-black text-[var(--color-primary)]">
            {name}
          </h3>

          {role !== "-" && (
            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
              {formatLabel(role)}
            </p>
          )}
        </div>
      </div>

      {email !== "-" && (
        <p className="mt-4 flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
          <Mail className="h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
          <span className="break-words">{email}</span>
        </p>
      )}
    </article>
  );
}

function MessageBubble({
  message,
  room,
}: {
  message: AdminRoomMessage;
  room: AdminRoom | null;
}) {
  const doc = getDoc(message);
  const senderKind = getSenderKind(message, room);
  const isSeller = senderKind === "seller";
  const isBuyer = senderKind === "buyer";
  const isUnknown = senderKind === "unknown";

  return (
    <article
      className={`flex gap-3 ${
        isBuyer ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm ${
          isSeller
            ? "bg-[var(--color-primary)]"
            : isBuyer
            ? "bg-[var(--color-secondary)] text-[var(--color-primary)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      >
        {getSenderInitial(message, room)}
      </div>

      <div
        className={`flex max-w-[min(78%,760px)] flex-col space-y-1.5 ${
          isBuyer ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`flex flex-wrap items-center gap-2 ${
            isBuyer ? "justify-end" : "justify-start"
          }`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-[0.14em] ${
              isSeller
                ? "text-[var(--color-primary)]"
                : isBuyer
                ? "text-[var(--color-secondary)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {getSenderLabel(message, room)}
          </p>

          <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">
            {formatDateTime(doc?.createdAt)}
          </p>
        </div>

        <div
          className={`rounded-3xl px-4 py-3 text-sm font-semibold leading-7 shadow-sm ${
            isSeller
              ? "rounded-tl-sm border border-[var(--color-border-light)] bg-white text-[var(--color-text-main)]"
              : isBuyer
              ? "rounded-tr-sm bg-[var(--color-primary)] text-white"
              : "border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {getMessageText(message)}
          </p>
        </div>

        {doc?.flagged && (
          <div
            className={`flex max-w-full items-start gap-2 rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/8 px-3 py-2 text-xs font-bold leading-5 text-[var(--color-danger)] ${
              isBuyer ? "text-right" : "text-left"
            }`}
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Flagged: {doc?.flag_reason || "No reason provided"}
            </span>
          </div>
        )}

        {isUnknown && (
          <span className="rounded-full bg-[var(--color-bg-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Sender not matched to seller/buyer
          </span>
        )}
      </div>
    </article>
  );
}

function AdminRoomMessagesPage() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as
    | {
        room?: AdminRoom;
        listingName?: string;
      }
    | null;

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, isError } = useGetAdminRoomMessagesQuery(
    {
      roomId,
      page,
      limit: 50,
    },
    {
      skip: !roomId,
    }
  );

  const { data: roomsResponse, isLoading: isRoomsLoading } =
    useGetAdminChatRoomsQuery({
      page: 1,
      limit: 500,
    });

  const { data: dealsResponse, isLoading: isDealsLoading } =
    useGetAdminDealsQuery({
      page: 1,
      limit: 500,
    });

  const rooms = getApiList(roomsResponse).map(getDoc) as AdminRoom[];
  const deals = getApiList(dealsResponse).map(getDoc) as AdminDeal[];

  const roomMap = useMemo(() => {
    return rooms.reduce((map: Record<string, AdminRoom>, room) => {
      const id = getRoomId(room);

      if (id) map[id] = room;

      return map;
    }, {});
  }, [rooms]);

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, AdminDeal>, deal) => {
      const id = getDealId(deal);

      if (id) map[id] = deal;

      return map;
    }, {});
  }, [deals]);

  const room = state?.room ? getDoc(state.room) : roomMap[roomId] || null;
  const listing = getRoomListing(room, dealMap);

  const listingName =
    state?.listingName ||
    getListingDisplayName(listing) ||
    "Linked listing unavailable";

  const listingMeta = getListingAddressMeta(listing);

  const messagesFromApi = getApiList(data).map(getDoc) as AdminRoomMessage[];
  const messages = [...messagesFromApi].reverse();

  const filteredMessages = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    if (!search) return messages;

    return messages.filter((message) => {
      const text = [
        getMessageText(message),
        getSenderLabel(message, room),
        message.flag_reason,
        message.type,
        formatDateTime(message.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });
  }, [messages, room, searchValue]);

  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const sellerName = room ? getPersonName(getDoc(room.seller_id)) : "-";
  const buyerName = room ? getPersonName(getDoc(room.buyer_id)) : "-";
  const seller = room ? getDoc(room.seller_id) : null;
  const buyer = room ? getDoc(room.buyer_id) : null;

  const flaggedCount = messages.filter((message) => getDoc(message)?.flagged).length;
  const roomStatus = getRoomStatus(room);
  const isContextLoading = isRoomsLoading || isDealsLoading;

  const latestActivity =
    room?.last_message_at || room?.updatedAt || room?.createdAt || "";

  function clearSearch() {
    setSearchValue("");
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <button
        type="button"
        onClick={() => navigate("/chat-rooms")}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Chat Rooms
      </button>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-secondary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Conversation Review
            </div>

            <h1 className="break-words font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              {isContextLoading && listingName === "Linked listing unavailable"
                ? "Loading listing..."
                : listingName}
            </h1>

            {listingMeta && (
              <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                <Building2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="break-words">{listingMeta}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={formatLabel(roomStatus)}
                variant={
                  roomStatus === "locked"
                    ? "danger"
                    : roomStatus === "inactive"
                    ? "warning"
                    : "success"
                }
              />

              <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-primary)]">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </span>

              {flaggedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-danger)]/10 px-3 py-1 text-xs font-black text-[var(--color-danger)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {flaggedCount} flagged
                </span>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[520px]">
            <DetailTile
              label="Seller"
              value={sellerName}
              icon={UserRound}
              featured
            />

            <DetailTile label="Buyer" value={buyerName} icon={UsersRound} />

            <DetailTile
              label="Latest"
              value={latestActivity ? formatDateTime(latestActivity) : "-"}
              icon={CalendarClock}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ParticipantCard title="Seller" person={seller} icon={UserRound} />
        <ParticipantCard title="Buyer" person={buyer} icon={UsersRound} />
      </section>

      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--color-border-light)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                  Conversation
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                  Review messages exchanged between seller and buyer.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-black text-[var(--color-primary)]">
                {room?.is_locked ? (
                  <LockKeyhole className="h-4 w-4" />
                ) : (
                  <UnlockKeyhole className="h-4 w-4" />
                )}
                {room?.is_locked ? "Locked" : "Open"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-black text-[var(--color-primary)]">
                <Clock3 className="h-4 w-4" />
                Page {pagination.page} of {totalPages}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <label htmlFor="room-message-search" className="sr-only">
                Search room messages
              </label>

              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                aria-hidden="true"
              />

              <input
                id="room-message-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search messages, sender, flag reason, or date..."
                className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
              />
            </div>

            <button
              type="button"
              disabled={!searchValue.trim()}
              onClick={clearSearch}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterX className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,var(--color-bg-soft)_0%,white_42%,var(--color-bg-soft)_100%)] p-4 sm:p-6">
          {isLoading ? (
            <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8">
              <Loader label="Loading messages..." />
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6">
              <h3 className="text-sm font-black text-[var(--color-danger)]">
                Failed to load room messages
              </h3>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Please refresh the page or try again later.
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--color-border-light)] bg-white p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
                <MessageSquare className="h-5 w-5" />
              </div>

              <h3 className="text-base font-black text-[var(--color-primary)]">
                No messages found
              </h3>

              <p className="max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                {searchValue.trim()
                  ? "No messages match your current search."
                  : "No messages have been sent in this room yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMessages.map((message, index) => (
                <MessageBubble
                  key={getMongoId(message) || index}
                  message={message}
                  room={room}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Page{" "}
          <span className="font-black text-[var(--color-primary)]">
            {pagination.page}
          </span>{" "}
          of{" "}
          <span className="font-black text-[var(--color-primary)]">
            {totalPages}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="justify-center"
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="justify-center"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminRoomMessagesPage;
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  Calendar,
  Eye,
  FilterX,
  Flag,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  ShieldAlert,
} from "lucide-react";

import {
  useGetAdminChatRoomsQuery,
  useGetAdminDealsQuery,
  useGetAdminFlaggedMessagesQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiList,
  getApiPagination,
  getListingTitle,
} from "../../utils/adminUtils";

type AdminPerson = {
  _id: string;
  id?: string;
  email?: string;
  full_name?: string;
  // fullName?: string;
  // name?: string;
};

type AdminListing = {
  _id: string;
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
};

type AdminDeal = {
  _id: string;
  id?: string;
  listing_id?: AdminListing | string;
  property_id?: AdminListing | string;
};

type AdminRoom = {
  _id: string;
  id?: string;
  deal_id?: string | AdminDeal;
  listing_id?: AdminListing | string;
  property_id?: AdminListing | string;
  seller_id?: string | AdminPerson;
  buyer_id?: string | AdminPerson;
  is_active?: boolean;
  is_locked?: boolean;
  last_message_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdminFlaggedMessage = {
  _id: string;
  id?: string;
  room_id: AdminRoom | string | null;
  sender_id: AdminPerson;
  content: string;
  type: string;
  flagged: boolean;
  flag_reason: string;
  is_read: boolean;
  read_at?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ReasonFilter = "all" | string;

function getDoc(value: any) {
  return (
    value?.data?.data?._doc ??
    value?.data?._doc ??
    value?._doc ??
    value?.data?.data ??
    value?.data ??
    value
  );
}

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const doc = getDoc(value);

  return doc?._id || doc?.id || "";
}

function formatLabel(value: string) {
  if (!value) return "Unknown";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPersonId(value: string | AdminPerson | undefined | null) {
  return getId(value);
}

function getRoomId(message: AdminFlaggedMessage) {
  return getId(message.room_id);
}

function getSenderId(message: AdminFlaggedMessage) {
  return getId(message.sender_id);
}

function getSenderEmail(message: AdminFlaggedMessage) {
  const sender = getDoc(message.sender_id);

  return sender?.email || "-";
}

function getSenderName(message: AdminFlaggedMessage) {
  const sender = getDoc(message.sender_id);

  return sender?.full_name || sender?.fullName || sender?.name || "-";
}

function getMessageText(message: AdminFlaggedMessage) {
  return message.content || "-";
}

function getFlagReason(message: AdminFlaggedMessage) {
  return message.flag_reason || "unknown";
}

function getDealIdFromRoom(room: AdminRoom | null | undefined) {
  const roomDoc = getDoc(room);

  if (!roomDoc?.deal_id) return "";

  return getId(roomDoc.deal_id);
}

function getListingFromDeal(deal: AdminDeal | undefined | any) {
  const dealDoc = getDoc(deal);

  if (!dealDoc) return null;

  const listing = dealDoc.listing_id || dealDoc.property_id;

  if (!listing || typeof listing === "string") return null;

  return getDoc(listing);
}

function getMatchedRoom(
  message: AdminFlaggedMessage,
  roomMap: Record<string, AdminRoom>
) {
  const roomId = getRoomId(message);

  if (!roomId) {
    return getDoc(message.room_id) || null;
  }

  return roomMap[roomId] || getDoc(message.room_id) || null;
}

function getRoomListingName(
  room: AdminRoom | null,
  dealMap: Record<string, AdminDeal>
) {
  const roomDoc = getDoc(room);

  if (!roomDoc) return "Linked listing unavailable";

  if (roomDoc.deal_id && typeof roomDoc.deal_id === "object") {
    const dealFromRoom = getDoc(roomDoc.deal_id);
    const listingFromRoomDeal = getListingFromDeal(dealFromRoom);

    if (listingFromRoomDeal) {
      return getListingTitle(listingFromRoomDeal);
    }
  }

  const dealId = getDealIdFromRoom(roomDoc);
  const matchedDeal = dealMap[dealId];

  if (matchedDeal) {
    const listingFromMatchedDeal = getListingFromDeal(matchedDeal);

    if (listingFromMatchedDeal) {
      return getListingTitle(listingFromMatchedDeal);
    }
  }

  if (roomDoc.listing_id && typeof roomDoc.listing_id === "object") {
    return getListingTitle(getDoc(roomDoc.listing_id));
  }

  if (roomDoc.property_id && typeof roomDoc.property_id === "object") {
    return getListingTitle(getDoc(roomDoc.property_id));
  }

  return "Linked listing unavailable";
}

function getSenderChatRole(
  message: AdminFlaggedMessage,
  room: AdminRoom | null
) {
  const roomDoc = getDoc(room);
  const senderId = getSenderId(message);
  const sellerId = getPersonId(roomDoc?.seller_id);
  const buyerId = getPersonId(roomDoc?.buyer_id);

  if (senderId && sellerId && senderId === sellerId) {
    return "Seller";
  }

  if (senderId && buyerId && senderId === buyerId) {
    return "Buyer";
  }

  return "-";
}

function getLatestFlagDate(messages: AdminFlaggedMessage[]) {
  const timestamps = messages
    .map((message) => new Date(message.createdAt).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return "-";

  return formatDateTime(new Date(Math.max(...timestamps)).toISOString());
}

function getUnreadFlagCount(messages: AdminFlaggedMessage[]) {
  return messages.filter((message) => !message.is_read).length;
}

function getLinkedRoomCount(
  messages: AdminFlaggedMessage[],
  roomMap: Record<string, AdminRoom>
) {
  return messages.filter((message) => Boolean(getMatchedRoom(message, roomMap)))
    .length;
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  featured = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-4 shadow-[var(--shadow-card)] transition-all duration-200 ${
        featured
          ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)] text-white"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${
              featured ? "text-white/70" : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 break-words text-lg font-black leading-tight ${
              featured ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${
              featured ? "text-white/70" : "text-[var(--color-text-muted)]"
            }`}
          >
            {helper}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white/10 text-white"
              : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
      {role}
    </span>
  );
}

function ReasonPill({ reason }: { reason: string }) {
  return (
    <span className="inline-flex rounded-full border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-danger)]">
      {formatLabel(reason)}
    </span>
  );
}

function OpenRoomButton({
  roomId,
  room,
  listingName,
}: {
  roomId: string;
  room: AdminRoom | null;
  listingName: string;
}) {
  return (
    <Link
      to={`/chat/${roomId}`}
      state={{
        room,
        listingName,
      }}
      aria-label="Open room messages"
      title="Open Messages"
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] transition-all duration-200 hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        Open Messages
      </span>
    </Link>
  );
}

function AdminFlagFilters({
  searchValue,
  reasonFilter,
  reasonOptions,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onReasonFilterChange,
  onClear,
}: {
  searchValue: string;
  reasonFilter: ReasonFilter;
  reasonOptions: Array<{ label: string; value: string }>;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onReasonFilterChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_240px_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-chat-flag-search" className="sr-only">
            Search flagged messages
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-chat-flag-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by sender, message, reason, listing, role, or date..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <div>
          <label htmlFor="admin-chat-flag-reason" className="sr-only">
            Filter by flag reason
          </label>

          <select
            id="admin-chat-flag-reason"
            value={reasonFilter}
            onChange={(event) => onReasonFilterChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 text-sm font-black text-[var(--color-primary)] outline-none transition focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          >
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={onClear}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{" "}
          <strong className="text-[var(--color-primary)]">{shownCount}</strong>{" "}
          of{" "}
          <strong className="text-[var(--color-primary)]">{totalCount}</strong>{" "}
          flagged messages on this page.
        </span>

        {hasActiveFilters && (
          <span className="text-[var(--color-primary)]">
            Search and filters are applied to the current loaded page.
          </span>
        )}
      </div>
    </section>
  );
}

function AdminFlagCard({
  message,
  room,
  listingName,
}: {
  message: AdminFlaggedMessage;
  room: AdminRoom | null;
  listingName: string;
}) {
  const roomId = room?._id || getRoomId(message);
  const senderRole = getSenderChatRole(message, room);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ReasonPill reason={getFlagReason(message)} />
            <RolePill role={senderRole} />
          </div>

          <h2 className="break-words text-base font-black leading-6 text-[var(--color-primary)]">
            {getSenderName(message)}
          </h2>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {getSenderEmail(message)}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <Flag className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)]">
          Flagged Message
        </p>

        <p className="mt-2 break-words text-sm font-semibold leading-6 text-[var(--color-text-main)]">
          {getMessageText(message)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Listing
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-primary)]">
            {listingName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
            {formatDateTime(message.createdAt)}
          </p>
        </div>
      </div>

      {roomId && (
        <div className="mt-5">
          <Link
            to={`/chat/${roomId}`}
            state={{
              room,
              listingName,
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Open Messages
          </Link>
        </div>
      )}
    </article>
  );
}

function AdminChatFlagsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>("all");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAdminFlaggedMessagesQuery({
    page,
    limit: 20,
  });

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

  const messages = getApiList(data) as AdminFlaggedMessage[];
  const rooms = getApiList(roomsResponse) as AdminRoom[];
  const deals = getApiList(dealsResponse) as AdminDeal[];
  const pagination = getApiPagination(data);
  const totalPages = pagination.totalPages || 1;

  const roomMap = useMemo(() => {
    return rooms.reduce((map: Record<string, AdminRoom>, room) => {
      const roomDoc = getDoc(room);
      const roomId = roomDoc?._id || roomDoc?.id;

      if (roomId) {
        map[roomId] = roomDoc;
      }

      return map;
    }, {});
  }, [rooms]);

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, AdminDeal>, deal) => {
      const dealDoc = getDoc(deal);
      const dealId = dealDoc?._id || dealDoc?.id;

      if (dealId) {
        map[dealId] = dealDoc;
      }

      return map;
    }, {});
  }, [deals]);

  const reasonOptions = useMemo(() => {
    const reasons = Array.from(
      new Set(messages.map((message) => getFlagReason(message)).filter(Boolean))
    );

    return [
      { label: "All reasons", value: "all" },
      ...reasons.map((reason) => ({
        label: formatLabel(reason),
        value: reason,
      })),
    ];
  }, [messages]);

  const reasonFilteredMessages =
    reasonFilter === "all"
      ? messages
      : messages.filter((message) => getFlagReason(message) === reasonFilter);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return reasonFilteredMessages;

    return reasonFilteredMessages.filter((message) => {
      const room = getMatchedRoom(message, roomMap);
      const listingName = getRoomListingName(room, dealMap);
      const senderRole = getSenderChatRole(message, room);

      const searchText = [
        getSenderName(message),
        getSenderEmail(message),
        senderRole,
        getFlagReason(message),
        getMessageText(message),
        listingName,
        formatDateTime(message.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [reasonFilteredMessages, searchValue, roomMap, dealMap]);

  const isPageLoading = isLoading || isRoomsLoading || isDealsLoading;
  const hasActiveFilters =
    searchValue.trim().length > 0 || reasonFilter !== "all";

  function clearFilters() {
    setSearchValue("");
    setReasonFilter("all");
    setPage(1);
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)]">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Moderation
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Chat Flags
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review flagged messages, understand sender context, and open the
              related conversation for moderation.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              Flagged Messages
            </p>
          </div>
        </div>
      </section>

      {!isPageLoading && !isError && messages.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Flags"
              value={filteredMessages.length}
              helper="After current filters"
              featured
              icon={<Flag className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Unread"
              value={getUnreadFlagCount(messages)}
              helper="Not marked as read"
              icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Linked Rooms"
              value={getLinkedRoomCount(messages, roomMap)}
              helper="Flags with chat context"
              icon={
                <MessageSquareWarning
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
            />

            <SummaryCard
              label="Latest Flag"
              value={getLatestFlagDate(messages)}
              helper="Most recent flag time"
              icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminFlagFilters
            searchValue={searchValue}
            reasonFilter={reasonFilter}
            reasonOptions={reasonOptions}
            shownCount={filteredMessages.length}
            totalCount={messages.length}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchValue}
            onReasonFilterChange={(value) => {
              setReasonFilter(value);
              setPage(1);
            }}
            onClear={clearFilters}
          />
        </>
      )}

      {isPageLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading flagged messages..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load flagged messages
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading chat moderation records.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="justify-center"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <Flag className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No flagged messages found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No flagged messages match your current search or filter selection."
              : "There are no flagged messages to review right now."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 2xl:hidden">
            {filteredMessages.map((message, index) => {
              const room = getMatchedRoom(message, roomMap);
              const listingName = getRoomListingName(room, dealMap);

              return (
                <AdminFlagCard
                  key={message._id || index}
                  message={message}
                  room={room}
                  listingName={listingName}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Flag Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Review the sender, reason, message content, and linked
                    listing.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {filteredMessages.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[21%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Sender
                  </th>

                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Reason
                  </th>

                  <th className="w-[28%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Message
                  </th>

                  <th className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Listing
                  </th>

                  <th className="w-[12%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Created
                  </th>

                  <th className="w-[6%] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMessages.map((message, index) => {
                  const room = getMatchedRoom(message, roomMap);
                  const roomId = room?._id || getRoomId(message);
                  const listingName = getRoomListingName(room, dealMap);
                  const senderRole = getSenderChatRole(message, room);

                  return (
                    <tr
                      key={message._id || index}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 font-black text-[var(--color-primary)]">
                          {getSenderName(message)}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          {getSenderEmail(message)}
                        </p>

                        <div className="mt-2">
                          <RolePill role={senderRole} />
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <ReasonPill reason={getFlagReason(message)} />
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-3 break-words rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 px-3 py-2 text-sm font-semibold leading-6 text-[var(--color-text-main)]">
                          {getMessageText(message)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-2 text-sm font-black text-[var(--color-primary)]">
                          {listingName}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          Deal conversation
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        <span className="block max-w-[150px] leading-5">
                          {formatDateTime(message.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center">
                        {roomId ? (
                          <div className="flex min-w-[48px] items-center justify-center">
                            <OpenRoomButton
                              roomId={roomId}
                              room={room}
                              listingName={listingName}
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

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

export default AdminChatFlagsPage;
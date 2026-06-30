import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useDeleteNotificationMutation,
  useLazyGetNotificationsQuery,
  useLazyGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type NotificationItem,
} from "../../services/notificationService";

interface NotificationDropdownProps {
  isDark: boolean;
  hasAuthSession: boolean;
}

function getNotificationId(notification: NotificationItem) {
  return notification?._id || notification?.id || "";
}

function getId(value: any) {
  if (!value) return "";

  if (typeof value === "string") return value;

  const doc = value?._doc ?? value;

  return doc?._id || doc?.id || "";
}

function getNotificationActionUrl(notification: NotificationItem) {
  return (
    notification?.action_url ||
    (notification as any)?.actionUrl ||
    ""
  );
}

function getNotificationChatRoomId(notification: NotificationItem) {
  const metadata = notification?.metadata || {};

  return (
    getId(metadata.room_id) ||
    getId(metadata.roomId) ||
    getId(metadata.chat_room_id) ||
    getId(metadata.chatRoomId) ||
    getId(metadata.room) ||
    getId(metadata.chatRoom) ||
    ""
  );
}

function normalizeInternalUrl(actionUrl: string) {
  if (!actionUrl || typeof actionUrl !== "string") return "";

  if (actionUrl.startsWith("http")) return "";

  return actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`;
}

function getNotificationTarget(notification: NotificationItem) {
  const type = String(notification?.type || "").toLowerCase();

  if (type === "chat_new_message") {
    const roomId = getNotificationChatRoomId(notification);

    if (roomId) {
      return `/chat/${roomId}`;
    }

    return "/chat";
  }

  const actionUrl = normalizeInternalUrl(getNotificationActionUrl(notification));

  return actionUrl || "/dashboard";
}

function formatNotificationTime(value?: string) {
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

function formatNotificationType(type?: string) {
  if (!type) return "Notification";

  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function NotificationDropdown({
  isDark,
  hasAuthSession,
}: NotificationDropdownProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [
    fetchNotifications,
    {
      data: notificationsData,
      isLoading: isLoadingNotifications,
      isFetching: isFetchingNotifications,
      error: notificationsError,
    },
  ] = useLazyGetNotificationsQuery();

  const [
    fetchUnreadNotificationCount,
    {
      data: unreadNotificationCount = 0,
      error: unreadNotificationError,
    },
  ] = useLazyGetUnreadNotificationCountQuery();

  const [markNotificationRead] = useMarkNotificationReadMutation();

  const [markAllNotificationsRead, { isLoading: isMarkingAllNotifications }] =
    useMarkAllNotificationsReadMutation();

  const [deleteNotification, { isLoading: isDeletingNotification }] =
    useDeleteNotificationMutation();

  const notifications = notificationsData?.data ?? [];

  const hasNotificationError = Boolean(
    notificationsError || unreadNotificationError
  );

  const notifBtn = isDark
    ? "border-white/10 bg-white/10 hover:bg-white/15"
    : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)]";

  const notifIcon = isDark
    ? "h-5 w-5 text-[var(--color-secondary)]"
    : "h-5 w-5 text-[var(--color-primary)]";

  useEffect(() => {
    if (!hasAuthSession) return;

    fetchUnreadNotificationCount();
  }, [hasAuthSession, fetchUnreadNotificationCount]);

  async function loadNotifications() {
    if (!hasAuthSession) return;

    await Promise.all([
      fetchUnreadNotificationCount(),
      fetchNotifications({
        page: 1,
        limit: 8,
      }),
    ]);
  }

  async function handleBellClick() {
    const nextOpenState = !isOpen;

    setIsOpen(nextOpenState);

    if (nextOpenState) {
      await loadNotifications();
    }
  }

  async function refreshAfterAction() {
    await Promise.all([
      fetchUnreadNotificationCount(),
      fetchNotifications({
        page: 1,
        limit: 8,
      }),
    ]);
  }

  async function handleNotificationClick(notification: NotificationItem) {
    const notificationId = getNotificationId(notification);
    const target = getNotificationTarget(notification);

    setIsOpen(false);

    navigate(target);

    if (notificationId && !notification.is_read) {
      try {
        await markNotificationRead(notificationId).unwrap();
        await refreshAfterAction();
      } catch (error) {
        // Do not block navigation if mark-read fails.
      }
    }
  }

  function handleNotificationKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    notification: NotificationItem
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleNotificationClick(notification);
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await markAllNotificationsRead().unwrap();
      await refreshAfterAction();
    } catch (error) {
      // Silent fail.
    }
  }

  async function handleDeleteNotification(
    event: MouseEvent<HTMLButtonElement>,
    notification: NotificationItem
  ) {
    event.preventDefault();
    event.stopPropagation();

    const notificationId = getNotificationId(notification);

    if (!notificationId) return;

    try {
      await deleteNotification(notificationId).unwrap();
      await refreshAfterAction();
    } catch (error) {
      // Silent fail.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${notifBtn}`}
        aria-label="Open notifications"
      >
        <Bell className={notifIcon} />

        {unreadNotificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1.5 text-[10px] font-black text-white ring-2 ring-white">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-[56px] z-50 w-[360px] overflow-hidden rounded-2xl border shadow-2xl ${
            isDark
              ? "border-white/10 bg-[var(--color-dark-card)]"
              : "border-[var(--color-border-light)] bg-white"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
              isDark ? "border-white/10" : "border-[var(--color-border-light)]"
            }`}
          >
            <div>
              <p
                className={`text-sm font-black ${
                  isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
              >
                Notifications
              </p>

              <p
                className={`mt-0.5 text-xs ${
                  isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
              >
                {hasNotificationError
                  ? "Unable to load notifications"
                  : unreadNotificationCount > 0
                    ? `${unreadNotificationCount} unread`
                    : "You are all caught up"}
              </p>
            </div>

            {!hasNotificationError && notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllNotificationsRead}
                disabled={isMarkingAllNotifications}
                className={`text-[10px] font-black uppercase tracking-[0.16em] transition disabled:opacity-50 ${
                  isDark
                    ? "text-[var(--color-secondary)] hover:text-white"
                    : "text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                }`}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {hasNotificationError && (
              <div className="px-5 py-8 text-center">
                <AlertTriangle className="mx-auto h-7 w-7 text-[var(--color-danger)]" />

                <p
                  className={`mt-3 text-sm font-black ${
                    isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
                >
                  Notification API error
                </p>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  Backend returned an error. Check backend logs.
                </p>
              </div>
            )}

            {!hasNotificationError &&
              (isLoadingNotifications || isFetchingNotifications) &&
              notifications.length === 0 && (
                <div className="flex items-center justify-center gap-2 px-5 py-8">
                  <Loader2
                    className={`h-5 w-5 animate-spin ${
                      isDark ? "text-white/60" : "text-[var(--color-primary)]"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    Loading notifications...
                  </span>
                </div>
              )}

            {!hasNotificationError &&
              !isLoadingNotifications &&
              !isFetchingNotifications &&
              notifications.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <AlertTriangle
                    className={`mx-auto h-7 w-7 ${
                      isDark
                        ? "text-[var(--color-secondary)]"
                        : "text-[var(--color-primary)]"
                    }`}
                  />

                  <p
                    className={`mt-3 text-sm font-black ${
                      isDark ? "text-white" : "text-[var(--color-primary)]"
                    }`}
                  >
                    No notifications yet
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    New listing, contract, deal, and chat updates will appear
                    here.
                  </p>
                </div>
              )}

            {!hasNotificationError &&
              notifications.map((notification) => {
                const notificationId = getNotificationId(notification);
                const isUnread = !notification.is_read;

                return (
                  <div
                    key={
                      notificationId ||
                      `${notification.type}-${notification.createdAt}`
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(event) =>
                      handleNotificationKeyDown(event, notification)
                    }
                    className={`group block cursor-pointer border-b px-5 py-4 text-left transition last:border-b-0 ${
                      isDark
                        ? "border-white/10 hover:bg-white/10"
                        : "border-[var(--color-border-light)] hover:bg-[var(--color-bg-soft)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isUnread
                            ? "bg-[var(--color-primary)] text-[var(--color-secondary)]"
                            : isDark
                              ? "bg-white/10 text-white/50"
                              : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {isUnread ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <CheckCheck className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-black ${
                                isDark
                                  ? "text-white"
                                  : "text-[var(--color-primary)]"
                              }`}
                            >
                              {notification.title || "Notification"}
                            </p>

                            <p
                              className={`mt-1 line-clamp-2 text-xs leading-5 ${
                                isDark
                                  ? "text-white/50"
                                  : "text-[var(--color-text-muted)]"
                              }`}
                            >
                              {notification.body || "-"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(event) =>
                              handleDeleteNotification(event, notification)
                            }
                            disabled={isDeletingNotification}
                            className={`shrink-0 rounded-full p-1 transition disabled:opacity-50 ${
                              isDark
                                ? "text-white/40 hover:bg-white/10 hover:text-white"
                                : "text-[var(--color-text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                            }`}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                              isDark
                                ? "border-white/10 text-white/40"
                                : "border-[var(--color-border-light)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {formatNotificationType(notification.type)}
                          </span>

                          {notification.createdAt && (
                            <span
                              className={`text-[10px] font-semibold ${
                                isDark
                                  ? "text-white/35"
                                  : "text-[var(--color-text-muted)]"
                              }`}
                            >
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          )}

                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div
            className={`border-t px-5 py-3 ${
              isDark ? "border-white/10" : "border-[var(--color-border-light)]"
            }`}
          >
            <button
              type="button"
              onClick={loadNotifications}
              className={`w-full text-center text-[10px] font-black uppercase tracking-[0.16em] ${
                isDark
                  ? "text-[var(--color-secondary)] hover:text-white"
                  : "text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
              }`}
            >
              Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
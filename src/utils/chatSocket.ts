import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "./apiBaseUrl";

let socket: Socket | null = null;

function getSocketBaseUrl() {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  if (socketUrl) return socketUrl;

  const apiBaseUrl = getApiBaseUrl();

  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

export function getChatSocket() {
  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      transports: ["websocket"],
    });
  }

  return socket;
}

export function disconnectChatSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
}
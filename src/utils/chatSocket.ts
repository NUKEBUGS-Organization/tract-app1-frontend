import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketBaseUrl() {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  if (socketUrl) return socketUrl;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

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
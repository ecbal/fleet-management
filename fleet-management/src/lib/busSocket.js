import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const busSocket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

busSocket.on("connect", () => console.log("[socket] connected:", busSocket.id));
busSocket.on("connect_error", (e) => console.log("[socket] error:", e.message));

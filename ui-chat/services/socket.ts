import { io, Socket } from "socket.io-client";
import { Message } from "../types";

type MessageListener = (message: Message) => void;
type MessageUpdatedListener = (message: Message) => void;
type MessageDeletedListener = (data: { messageId: number }) => void;
type RoomDeletedListener = (data: { roomId: number }) => void;
type RoomRenamedListener = (data: { roomId: number; name: string }) => void;
type TypingListener = (data: { roomId: string; userId: number; username: string }) => void;
type StopTypingListener = (data: { roomId: string; userId: number }) => void;

const API_BASE = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3002";

class RealSocket {
  private socket: Socket | null = null;

  private ensureConnected() {
    if (this.socket) return;

    this.socket = io(API_BASE, {
      transports: ["websocket"], // force websocket
    });

    this.socket.on("connect", () => {
      console.log("✅ chat socket connected", this.socket?.id);
    });

    this.socket.on("connect_error", (e) => {
      console.log("⚠️ chat socket connect_error", e.message);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ chat socket disconnected");
    });
  }

  subscribe(
    roomId: number,
    onMessage: MessageListener,
    onMessageUpdated?: MessageUpdatedListener,
    onMessageDeleted?: MessageDeletedListener
  ) {
    this.ensureConnected();
    if (!this.socket) return () => {};

    this.socket.emit("joinRoom", String(roomId));

    const messageHandler = (msg: Message) => {
      if (msg.roomId === roomId) onMessage(msg);
    };

    const updateHandler = (msg: Message) => {
      if (msg.roomId === roomId && onMessageUpdated) onMessageUpdated(msg);
    };

    const deleteHandler = (data: { messageId: number }) => {
      if (onMessageDeleted) onMessageDeleted(data);
    };

    this.socket.on("message", messageHandler);
    this.socket.on("messageUpdated", updateHandler);
    this.socket.on("messageDeleted", deleteHandler);

    return () => {
      if (!this.socket) return;
      this.socket.off("message", messageHandler);
      this.socket.off("messageUpdated", updateHandler);
      this.socket.off("messageDeleted", deleteHandler);
      this.socket.emit("leaveRoom", String(roomId));
    };
  }

  emitTyping(roomId: number, userId: number, username: string) {
    this.ensureConnected();
    this.socket?.emit("typing", { roomId: String(roomId), userId, username });
  }

  emitStopTyping(roomId: number, userId: number) {
    this.ensureConnected();
    this.socket?.emit("stopTyping", { roomId: String(roomId), userId });
  }

  subscribeTyping(
    roomId: number,
    onTyping: TypingListener,
    onStopTyping: StopTypingListener
  ) {
    this.ensureConnected();
    if (!this.socket) return () => {};

    const typingHandler = (data: { roomId: string; userId: number; username: string }) => {
      if (String(data.roomId) === String(roomId)) onTyping(data);
    };

    const stopHandler = (data: { roomId: string; userId: number }) => {
      if (String(data.roomId) === String(roomId)) onStopTyping(data);
    };

    this.socket.on("typing", typingHandler);
    this.socket.on("stopTyping", stopHandler);

    return () => {
      if (!this.socket) return;
      this.socket.off("typing", typingHandler);
      this.socket.off("stopTyping", stopHandler);
    };
  }

  subscribeRoomEvents(
    roomId: number,
    onRoomDeleted: RoomDeletedListener,
    onRoomRenamed: RoomRenamedListener
  ) {
    this.ensureConnected();
    if (!this.socket) return () => {};

    const deletedHandler = (data: { roomId: number }) => {
      if (data.roomId === roomId) onRoomDeleted(data);
    };

    const renamedHandler = (data: { roomId: number; name: string }) => {
      if (data.roomId === roomId) onRoomRenamed(data);
    };

    this.socket.on("roomDeleted", deletedHandler);
    this.socket.on("roomRenamed", renamedHandler);

    return () => {
      if (!this.socket) return;
      this.socket.off("roomDeleted", deletedHandler);
      this.socket.off("roomRenamed", renamedHandler);
    };
  }
}

export const socket = new RealSocket();

import { SUCCESS_MESSAGES } from "../constants.ts";
import { sendAcknowledgement, wrapResponse } from "../utils/responseWrapper.ts";

export class SocketManager {
  private userSocketMap: Map<string, WebSocket>;
  private static instance: SocketManager | null = null;

  constructor() {
    this.userSocketMap = new Map();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public addUserSocket(userId: string, socket: WebSocket): WebSocket {
    this.userSocketMap.set(userId, socket);
    return socket;
  }

  public getUserSocket(userId: string): WebSocket | undefined {
    return this.userSocketMap.get(userId);
  }

  public removeUserSocket(userId: string): void {
    this.userSocketMap.delete(userId);
  }

  public broadcast(message: unknown): void {
    const response = wrapResponse<typeof message>(message);

    for (const userSocket of this.userSocketMap.values()) {
      if (userSocket.readyState === WebSocket.OPEN) {
        userSocket.send(response);
      }
    }
  }

  public sendToreceiver(
    receiverId: string,
    data: unknown,
    sender?: WebSocket
  ): void {
    const receiver = this.userSocketMap.get(receiverId);

    if (receiver && receiver.readyState === WebSocket.OPEN) {
      const response = wrapResponse<typeof data>(data);
      receiver.send(response);
      if (sender) sender.send(sendAcknowledgement());
    } else {
      if (sender && sender.readyState === WebSocket.OPEN) {
        sender.send(JSON.stringify(SUCCESS_MESSAGES.RECEIVER_OFFLINE));
      }
    }
  }

  public send(socket: WebSocket, data: unknown) {
    if (socket.readyState === WebSocket.OPEN) {
      const response = wrapResponse(data);
      socket.send(response);
    }
  }
}

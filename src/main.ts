import { validate } from "uuidValidator";
import { verifyAuthToken } from "./auth/validateToken.ts";
import { SocketManager } from "./manager/socketManager.ts";
import { wrapResponse } from "./utils/responseWrapper.ts";

Deno.serve(async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const [error, payload] = await verifyAuthToken(req);
  if (!payload) {
    return new Response(error ?? "unauthorized access", {
      status: 401,
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const manager = SocketManager.getInstance();

  socket.addEventListener("open", () => {
    manager.addUserSocket(payload.id, socket);
    manager.send(socket, "connected successfully");
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      const receiverId = data.receiverId;
      if (!validate(receiverId)) {
        manager.send(socket, "invalid receiver", true);
      } else {
        manager.sendToreceiver(receiverId, { data: event.data }, socket);
      }
    } catch (error) {
      manager.send(
        socket,
        (error as Error)?.message ?? "invalid message format",
        true
      );
    }
  });

  socket.addEventListener("error", (ev) => {
    socket.close(1008, wrapResponse(ev, true));
  });

  socket.addEventListener("close", (ev) => {
    socket.close(ev.code, wrapResponse("successfully disconnected"));
  });

  return response;
});

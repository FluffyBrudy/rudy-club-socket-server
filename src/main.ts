import { verifyAuthToken } from "./auth/validateToken.ts";
import { SocketManager } from "./manager/socketManager.ts";

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
    console.log(event.data);
  });

  socket.addEventListener("error", (_) => {
    socket.close(1008);
  });

  return response;
});

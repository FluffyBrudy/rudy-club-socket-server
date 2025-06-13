import { validate } from "https://deno.land/std@0.177.0/uuid/mod.ts";
import { verifyAuthToken } from "./auth/validateToken.ts";
import { SocketManager } from "./manager/socketManager.ts";
import { RequestBodyData } from "./types/httpModeRequest.ts";
import {
  JSON_HEADERS,
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./constants.ts";

Deno.serve(async (req) => {
  const [error, payload] = await verifyAuthToken(req);
  if (!payload) {
    return new Response(JSON.stringify(error), {
      status: STATUS_CODES.UNAUTHORIZED_REQUEST,
      headers: JSON_HEADERS,
    });
  }

  const url = req.url;

  if (url.endsWith("/send-notification")) {
    try {
      const body: Partial<RequestBodyData> = await req.json();

      if (body.data === undefined || !body.receiverId) {
        return new Response(JSON.stringify(ERROR_MESSAGES.MISSING_FIELDS), {
          status: STATUS_CODES.UNPROCESSABLE_ENTITY,
          headers: JSON_HEADERS,
        });
      }

      if (body.receiverId && !validate(body.receiverId)) {
        return new Response(JSON.stringify(ERROR_MESSAGES.INVALID_RECEIVER), {
          status: STATUS_CODES.UNPROCESSABLE_ENTITY,
          headers: JSON_HEADERS,
        });
      }

      /**
        Its not inteded to be successfully send, there may be case when receiver is offline
        but if usre is active it sends successfully
       */
      const manager = SocketManager.getInstance();
      manager.sendToreceiver(body.receiverId, body.data);

      return new Response(JSON.stringify(SUCCESS_MESSAGES.NOTIFICATION_SENT), {
        status: STATUS_CODES.SUCCESS,
        headers: JSON_HEADERS,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error:
            (error as Error)?.message || ERROR_MESSAGES.GENERIC_ERROR.error,
        }),
        {
          status: STATUS_CODES.INTERNAL_SERVER_ERROR,
          headers: JSON_HEADERS,
        }
      );
    }
  }

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const manager = SocketManager.getInstance();

  socket.addEventListener("open", () => {
    manager.addUserSocket(payload.id, socket);
    manager.send(socket, SUCCESS_MESSAGES.CONNECTED_SUCCESSFULLY);
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      const receiverId = data.receiverId;
      if (!validate(receiverId)) {
        manager.send(socket, ERROR_MESSAGES.INVALID_RECEIVER);
      } else {
        manager.sendToreceiver(receiverId, event.data, socket);
      }
    } catch (error) {
      manager.send(
        socket,
        (error as Error)?.message ?? ERROR_MESSAGES.BAD_JSON_ERROR
      );
    }
  });

  socket.addEventListener("error", (_) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close(1011, JSON.stringify(ERROR_MESSAGES.GENERIC_ERROR));
    }
  });

  socket.addEventListener("close", (_) => {
    manager.removeUserSocket(payload.id);
  });

  return response;
});

Deno.serve((req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    console.log("a client connected");
    socket.send("goodjob");
  });

  socket.addEventListener("message", (event) => {
    console.log(event.data);
    socket.send("dattebayo");
  });

  return response;
});

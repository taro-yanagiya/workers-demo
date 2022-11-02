/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

export { RoomDO as Room } from "./RoomDO";

export interface Env {
  ROOM: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

app.use(
  "/rooms",
  cors({
    origin: ["*"],
  }),
);

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (c.req.headers.get("Upgrade") == "websocket") {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      let pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({ error: err }));
      pair[1].close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: pair[0] });
    } else {
      return new Response(JSON.stringify({ error: "unknown" }), {
        status: 500,
      });
    }
  }
});

app.post("/rooms", (c) => {
  const id = c.env.ROOM.newUniqueId();
  return c.text(id.toString(), 200);
});

app.get("/rooms/:roomId", async (c) => {
  const { roomId } = c.req.param();
  const id = c.env.ROOM.idFromString(roomId);
  const room = c.env.ROOM.get(id);

  return await room.fetch(c.req as Request);
});

export default app;

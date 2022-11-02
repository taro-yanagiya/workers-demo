import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Room } from "server-shared/src/Room";
import { WebSocketWrapper } from "./WebSocketWrapper";

export class RoomDO {
  state: DurableObjectState;
  app: Hono;
  roomObj: Room = new Room();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;

    this.app = new Hono();

    this.app.use(
      "/rooms/:roomId/vote",
      cors({
        origin: ["*"],
      }),
    );

    this.app.use("*", logger());

    this.app.get("/rooms/:roomId", async (c) => {
      if (c.req.headers.get("Upgrade") != "websocket") {
        c.status(400);
        return c.body("expected websocket");
      }

      const pair = new WebSocketPair();
      await this.roomObj.onConnected(new WebSocketWrapper(pair[1]));

      return new Response(null, { status: 101, webSocket: pair[0] });
    });
  }

  async fetch(request: Request): Promise<Response> {
    const res = await this.app.fetch(request);
    return res;
  }
}

interface Env {}

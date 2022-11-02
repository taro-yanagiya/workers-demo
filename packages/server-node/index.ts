import { Room } from "server-shared/src/Room";
import { WebSocketServer } from "ws";
import { WebSocketWrapper } from "./WebSocketWrapper";

const port = Number.parseInt(process.env.PORT as string);
const wss = new WebSocketServer({ port });

const room = new Room();

wss.on("connection", (ws) => {
  ws.binaryType = "arraybuffer";
  console.log("connection");
  room.onConnected(new WebSocketWrapper(ws));
});

console.log(`listening on ${port}`);

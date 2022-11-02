import { Room } from "server-shared/src/Room";
import { WebSocketServer } from "ws";
import { WebSocketWrapper } from "./WebSocketWrapper";

const wss = new WebSocketServer({ port: 3000 });

const room = new Room();

wss.on("connection", (ws) => {
  ws.binaryType = "arraybuffer";
  console.log("connection");
  room.onConnected(new WebSocketWrapper(ws));
});

console.log("listening on 3000");

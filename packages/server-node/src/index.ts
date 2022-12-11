import { WebSocketServer } from "ws";
import { WebSocketWrapper } from "~/WebSocketWrapper";
import { Room } from "~server-model/Room";

const port = Number.parseInt(process.env.PORT as string);
console.log(process.env);
const wss = new WebSocketServer({ port });

const room = new Room();

wss.on("connection", (ws) => {
  ws.binaryType = "arraybuffer";
  console.log("connection");
  room.onConnected(new WebSocketWrapper(ws));
});

console.log(`listening on ${port}`);

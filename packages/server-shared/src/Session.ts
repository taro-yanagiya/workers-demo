import { writeString } from "shared/src/buffer-util";
import { MessageType } from "shared/src/message";
import { SessionId } from "shared/src/types";
import { IWebSocket } from "./IWebSocket";
import { createError, Room } from "./Room";

export class Session {
  room: Room;
  id: SessionId;
  blockedMessages: ArrayBuffer[] = [];
  webSocket: IWebSocket;
  quit: boolean = false;
  ready: boolean = false;

  constructor(id: SessionId, webSocket: IWebSocket, room: Room) {
    this.id = id;
    this.webSocket = webSocket;
    this.room = room;

    webSocket.onMessage((data) => {
      if (!(data instanceof ArrayBuffer)) {
        console.error("Not an ArrayBuffer message");
        const buffer = createError("not ArrayBuffer");
        this.sendMessage(buffer);
        return;
      }

      try {
        this.onMessage(data);
      } catch (err) {
        if (err instanceof Error) {
          const buffer = createError("error sending a message");
          this.sendMessage(buffer);
          console.error(err.stack);
        } else {
          const buffer = createError("unknown error");
          this.sendMessage(buffer);
        }
      }
    });

    const closeOrErrorHandler = () => {
      this.quit = true;
      this.room.onDisconnected(this.id);
      if (this.ready) {
        const buffer = new Uint8Array(new ArrayBuffer(2));
        buffer[0] = MessageType.Server.QUIT;
        buffer[1] = this.id;
        this.room.broadcast(buffer.buffer, null);
      }
    };
    webSocket.onClose(closeOrErrorHandler);
    webSocket.onError(closeOrErrorHandler);
  }

  sendMessage(message: ArrayBuffer) {
    if (this.quit) {
      this.webSocket.close(1011, "WebSocket broken.");
      return;
    }

    const view = new DataView(message);
    if (!this.ready && view.getUint8(0) !== MessageType.Server.ERROR) {
      this.blockedMessages.push(message);
      return;
    }

    try {
      this.webSocket.send(message);
    } catch (err) {
      console.log(`Failed to send message (session ID: ${this.id})`);
      this.quit = true;
      this.webSocket.close(1011, "WebSocket broken.");
      return;
    }
  }

  onMessage(message: ArrayBuffer) {
    if (this.quit) {
      this.webSocket.close(1011, "WebSocket broken.");
      return;
    }
    const view = new DataView(message);

    switch (view.getUint8(0)) {
      case MessageType.Client.JOIN:
        if (this.ready) {
          const buffer = createError("already joined");
          this.sendMessage(buffer);
          return;
        }
        this.blockedMessages.forEach((message) => {
          try {
            this.webSocket.send(message);
          } catch (err) {
            console.log(`Failed to send message (session ID: ${this.id})`);
            this.quit = true;
            this.webSocket.close(1011, "WebSocket broken.");
            return;
          }
        });
        this.blockedMessages = [];
        this.ready = true;
        const broadcastBuf = new Uint8Array(2);
        broadcastBuf[0] = MessageType.Server.JOINED;
        broadcastBuf[1] = this.id;
        this.room.broadcast(broadcastBuf.buffer, this.id);
        const readyBuf = new Uint8Array(2);
        readyBuf[0] = MessageType.Server.READY;
        readyBuf[1] = this.id;
        this.sendMessage(readyBuf.buffer);
        this.room.canvas.objects.forEach((obj) => {
          const objBuf = new DataView(new ArrayBuffer(8 + 16));
          objBuf.setUint8(0, MessageType.Server.OBJ);
          objBuf.setUint8(1, obj.id);
          objBuf.setInt16(2, obj.actualX);
          objBuf.setInt16(4, obj.actualY);
          objBuf.setUint16(6, obj.radius);
          writeString(obj.color, objBuf.buffer, 8, 16);
          this.sendMessage(objBuf.buffer);
        });
        break;
      case MessageType.Client.CURSOR: {
        const x = view.getInt16(1);
        const y = view.getInt16(3);
        const sendingView = new DataView(new ArrayBuffer(6));
        sendingView.setUint8(0, MessageType.Server.CURSOR);
        sendingView.setUint8(1, this.id);
        sendingView.setInt16(2, x);
        sendingView.setInt16(4, y);
        this.room.broadcast(sendingView.buffer, this.id);
        break;
      }
      case MessageType.Client.DOWN: {
        const x = view.getInt16(1);
        const y = view.getInt16(3);
        this.room.canvas.onMouseDown(this.id, x, y);
        const sendingView = new DataView(new ArrayBuffer(6));
        sendingView.setUint8(0, MessageType.Server.DOWN);
        sendingView.setUint8(1, this.id);
        sendingView.setInt16(2, x);
        sendingView.setInt16(4, y);
        this.room.broadcast(sendingView.buffer, this.id);
        break;
      }
      case MessageType.Client.DRAG: {
        const dx = view.getInt16(1);
        const dy = view.getInt16(3);
        this.room.canvas.onMouseDrag(this.id, dx, dy);
        const sendingView = new DataView(new ArrayBuffer(6));
        sendingView.setUint8(0, MessageType.Server.DRAG);
        sendingView.setUint8(1, this.id);
        sendingView.setInt16(2, dx);
        sendingView.setInt16(4, dy);
        this.room.broadcast(sendingView.buffer, this.id);
        break;
      }
      case MessageType.Client.UP: {
        this.room.canvas.onMouseUp(this.id);
        const sendingView = new DataView(new ArrayBuffer(3));
        sendingView.setUint8(0, MessageType.Server.UP);
        sendingView.setUint8(1, this.id);
        this.room.broadcast(sendingView.buffer, this.id);
        break;
      }
      default:
        const buffer = createError("unknown message");
        this.sendMessage(buffer);
        return;
    }
  }
}

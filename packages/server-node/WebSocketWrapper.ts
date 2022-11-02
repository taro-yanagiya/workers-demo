import { IWebSocket } from "server-shared/src/IWebSocket";
import { WebSocket } from "ws";

export class WebSocketWrapper implements IWebSocket {
  ws: WebSocket;
  constructor(ws: WebSocket) {
    this.ws = ws;
  }
  accept(): void {}
  onMessage(listenter: (message: string | ArrayBuffer) => void): void {
    this.ws.on("message", (data) => {
      if (!(data instanceof ArrayBuffer)) {
        throw "Buffer or Buffer[] is not supported";
      }

      const buf = data as ArrayBuffer;
      listenter(buf);
    });
  }
  onClose(listener: () => void): void {
    this.ws.on("close", () => listener());
  }
  onError(listener: () => void): void {
    this.ws.on("error", () => listener());
  }
  send(message: string | ArrayBuffer | ArrayBufferView): void {
    this.ws.send(message);
  }
  close(code: number, message: string): void {
    this.ws.close(code, message);
  }
}

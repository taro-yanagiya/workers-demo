import { IWebSocket } from "server-shared/src/IWebSocket";

export class WebSocketWrapper implements IWebSocket {
  ws: WebSocket;

  constructor(websocket: WebSocket) {
    this.ws = websocket;
  }
  close(code?: number, reason?: string): void {
    this.ws.close(code, reason);
  }

  accept(): void {
    this.ws.accept();
  }
  onMessage(listener: (message: string | ArrayBuffer) => void): void {
    this.ws.addEventListener("message", (message) => {
      listener(message.data);
    });
  }
  onClose(listener: EventListener<Event>): void {
    this.ws.addEventListener("close", (e) => {
      listener(e);
    });
  }
  onError(listener: EventListener<Event>): void {
    this.ws.addEventListener("error", (e) => {
      listener(e);
    });
  }
  send(message: string | ArrayBuffer | ArrayBufferView): void {
    this.ws.send(message);
  }
}

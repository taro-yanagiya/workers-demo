import { v4 as uuid } from "uuid";

type OnMessageCallback = (data: ArrayBuffer) => void;

export class WebSocketConnection {
  webSocket: WebSocket | null = null;

  readonly callbacks: Map<string, OnMessageCallback> = new Map();

  async connect(
    roomId: string,
    onClose: () => void,
    useNode = false,
  ): Promise<void> {
    if (useNode) {
      this.webSocket = new WebSocket(
        `${window.ENV.SERVER_NODE_WS_URL}/rooms/${roomId}`,
      );
      console.log("use node");
    } else {
      this.webSocket = new WebSocket(
        `${window.ENV.SERVER_WS_URL}/rooms/${roomId}`,
      );
      console.log("not use node");
    }
    this.webSocket.binaryType = "arraybuffer";
    return await new Promise((resolve, reject) => {
      if (this.webSocket === null) {
        reject(new Error("websocket is null"));
        return;
      }

      this.webSocket.addEventListener("open", (event) => {
        console.log("Connected to server");
        resolve();
      });
      this.webSocket.addEventListener("message", (event) => {
        if (!(event.data instanceof ArrayBuffer)) {
          console.error("Message is not ArrayBuffer");
          return;
        }
        this.callbacks.forEach((cb) => {
          cb(event.data);
        });
      });
      this.webSocket.addEventListener("error", (_) => {
        onClose();
        reject(new Error("websocket error"));
      });
      this.webSocket.addEventListener("close", (event) => {
        console.log("Connection closed");
        onClose();
        reject(new Error("connection closed"));
      });
    });
  }

  addOnMessageCallback(callback: (message: ArrayBuffer) => void): string {
    const id = uuid();
    this.callbacks.set(id, callback);
    return id;
  }

  removeOnMessageCallback(id: string): void {
    this.callbacks.delete(id);
  }

  sendMessage(data: ArrayBuffer): void {
    if (this.webSocket == null) return;
    this.webSocket.send(data);
  }
}

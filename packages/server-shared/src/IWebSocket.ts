export interface IWebSocket {
  accept(): void;
  onMessage(listenter: (data: string | ArrayBuffer) => void): void;
  onClose(listener: () => void): void;
  onError(listener: () => void): void;
  send(message: string | ArrayBuffer | ArrayBufferView): void;
  close(code: number, message: string): void;
}

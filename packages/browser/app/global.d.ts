export {};

declare global {
  interface Window {
    ENV: {
      SERVER_URL: string;
      SERVER_WS_URL: string;
      SERVER_NODE_WS_URL: string;
    };
  }
}

import type { MetaFunction, TypedResponse } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { ReactElement } from "react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader(): Promise<TypedResponse> {
  return json({
    ENV: {
      SERVER_URL: "http://127.0.0.1:8787",
      // SERVER_URL: "https://workers-demo-server.taro-yanagiya.workers.dev",
      SERVER_WS_URL: "ws://127.0.0.1:8787",
      // SERVER_WS_URL: "wss://workers-demo-server.taro-yanagiya.workers.dev",
      SERVER_NODE_WS_URL: "ws://127.0.0.1:3000",
    },
  });
}

export default function App(): ReactElement {
  const data = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

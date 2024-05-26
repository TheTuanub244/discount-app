import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {NextUIProvider} from "@nextui-org/react";
import "./output.css"
export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="./output.css"
          />
        <Meta />
        <Links />
      </head>
      <body>
        <NextUIProvider>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        </NextUIProvider>
      </body>
    </html>
  );
}

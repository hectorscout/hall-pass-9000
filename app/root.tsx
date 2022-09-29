import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./utils/session.server";
import { getEnv } from "~/env.server";
import { getSettings } from "~/models/settings.server";
import { Toaster } from "react-hot-toast";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Hall Pass 9000",
  viewport: "width=device-width,initial-scale=1",
});

export type RootLoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  userSettings: Record<string, string>;
  ENV: ReturnType<typeof getEnv>;
};

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  const userSettings = (await getSettings(user?.id ?? "")).reduce(
    (settings, setting) => {
      settings[setting.name] = setting.value;
      return settings;
    },
    {} as Record<string, string>
  );
  return json({
    user,
    userSettings,
    ENV: getEnv(),
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <LiveReload />
        <Toaster
          position="bottom-center"
          toastOptions={{ style: { background: "#444", color: "#FFF" } }}
        />
      </body>
    </html>
  );
}

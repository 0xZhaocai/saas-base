// app/root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { AppProvider } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Toaster } from "@/components/ui/sonner";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", href: "/favicon.ico" },
];

// 基础 meta 标签 - 各路由可通过 meta() 覆盖
export const meta: Route.MetaFunction = () => [
  { title: APP_CONFIG.name },
  { name: "description", content: APP_CONFIG.description },
  { property: "og:title", content: APP_CONFIG.name },
  { property: "og:description", content: APP_CONFIG.description },
  { property: "og:image", content: APP_CONFIG.seo.ogImage },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:site", content: APP_CONFIG.seo.twitterHandle },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Prevent flash of wrong theme + Set dynamic lang */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme
                  var theme = JSON.parse(localStorage.getItem('app-theme'));
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                  // Language
                  var lang = JSON.parse(localStorage.getItem('app-language'));
                  if (lang) {
                    document.documentElement.setAttribute('lang', lang);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Outlet />
      <Toaster />
    </AppProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">{message}</h1>
        <p className="text-lg text-muted-foreground mb-8">{details}</p>
        {stack && (
          <pre className="max-w-2xl mx-auto p-4 overflow-x-auto bg-muted rounded-lg text-left text-sm">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}

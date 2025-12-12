import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const mode = import.meta.env.MODE ?? "production";
const build: () => Promise<ServerBuild> = import.meta.env.DEV
  ? (() => import("virtual:react-router/server-build") as unknown as Promise<ServerBuild>)
  : (() =>
      // @ts-expect-error build output exists at runtime after `react-router build`
      import("../build/server/index.js").then(
        (m) => ((m as unknown as { default?: ServerBuild }).default ?? (m as unknown as ServerBuild))
      ));
console.log("[worker] mode:", mode);

// Use the built server bundle produced by `react-router build`
const requestHandler = createRequestHandler(build, mode);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve built static assets (CSS/JS/fonts) directly
    if (!import.meta.env.DEV) {
      if (
        url.pathname.startsWith("/assets/") ||
        url.pathname === "/favicon.ico" ||
        url.pathname === "/robots.txt"
      ) {
        const assets = (env as unknown as { ASSETS?: Fetcher }).ASSETS;
        if (assets) {
          const assetResponse = await assets.fetch(request);
          if (assetResponse.status !== 404) {
            return assetResponse;
          }
        }
      }
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;

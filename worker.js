
import { onRequestPost as chatHandler } from "./functions/api/chat.js";
import { onRequestGet as healthHandler } from "./functions/api/health.js";
import { onRequestPost as solveHandler } from "./functions/api/solve.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return healthHandler({ request, env, params: {} });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return chatHandler({ request, env, params: {} });
    }

    if (url.pathname === "/api/solve" && request.method === "POST") {
      return solveHandler({ request, env, params: {} });
    }

    if (["/api/chat", "/api/health", "/api/solve"].includes(url.pathname)) {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    if (!env.ASSETS) {
      return new Response("Website assets are not configured.", {
        status: 500
      });
    }

    return env.ASSETS.fetch(request);
  }
};

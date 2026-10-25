
import { onRequestPost as chatHandler } from "./functions/api/chat.js";
import { onRequestGet as healthHandler } from "./functions/api/health.js";
import { onRequestPost as solveHandler } from "./functions/api/solve.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // VEDAI health check
    if (path === "/api/health" && method === "GET") {
      return healthHandler({ request, env, params: {} });
    }

    // VEDAI chat
    if (path === "/api/chat" && method === "POST") {
      return chatHandler({ request, env, params: {} });
    }

    // Academix image question solver
    if (path === "/api/solve" && method === "POST") {
      return solveHandler({ request, env, params: {} });
    }

    // Reject unsupported API methods
    if (["/api/chat", "/api/health", "/api/solve"].includes(path)) {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Serve website assets
    if (!env.ASSETS) {
      return new Response("Website assets are not configured.", {
        status: 500
      });
    }

    return env.ASSETS.fetch(request);
  }
};

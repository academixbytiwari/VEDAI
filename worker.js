
import { onRequestPost as chatHandler } from "./functions/api/chat.js";
import { onRequestGet as healthHandler } from "./functions/api/health.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check API
    if (url.pathname === "/api/health" && request.method === "GET") {
      return healthHandler({ request, env, params: {} });
    }

    // Chat API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return chatHandler({ request, env, params: {} });
    }

    // Handle unsupported API methods
    if (url.pathname === "/api/chat" || url.pathname === "/api/health") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Serve VEDAI website files
    if (!env.ASSETS) {
      return new Response("Website assets are not configured.", {
        status: 500
      });
    }

    return env.ASSETS.fetch(request);
  }
};

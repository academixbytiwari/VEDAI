
import { onRequestPost as chatHandler } from "./functions/api/chat.js";
import { onRequestGet as healthHandler } from "./functions/api/health.js";
import { onRequestPost as solveHandler } from "./functions/api/solve.js";

const ALLOWED_ORIGIN = "https://academixbytiwari.github.io";

function addCorsHeaders(response, origin) {
  const headers = new Headers(response.headers);

  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Vary", "Origin");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function jsonError(message, status, origin) {
  return addCorsHeaders(
    Response.json({ error: message }, { status }),
    origin
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get("Origin");

    const apiPaths = [
      "/api/chat",
      "/api/health",
      "/api/solve"
    ];

    // Handle browser CORS preflight requests
    if (apiPaths.includes(path) && method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    let response;

    try {
      // VEDAI health check
      if (path === "/api/health" && method === "GET") {
        response = await healthHandler({
          request, env, params: {}
        });
        return addCorsHeaders(response, origin);
      }

      // VEDAI chat
      if (path === "/api/chat" && method === "POST") {
        response = await chatHandler({
          request, env, params: {}
        });
        return addCorsHeaders(response, origin);
      }

      // Academix image question solver
      if (path === "/api/solve" && method === "POST") {
        response = await solveHandler({
          request, env, params: {}
        });
        return addCorsHeaders(response, origin);
      }

      // Reject unsupported API methods
      if (apiPaths.includes(path)) {
        return jsonError("Method not allowed", 405, origin);
      }

      // Serve website assets
      if (!env.ASSETS) {
        return new Response("Website assets are not configured.", {
          status: 500
        });
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Worker request failed:", error);
      return jsonError("Internal server error", 500, origin);
    }
  }
};

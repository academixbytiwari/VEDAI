
export async function onRequestGet({ env }) {
  return Response.json({
    online: true,
    model: "@cf/meta/llama-3.2-1b-instruct",
    ollama: false,
    modelAvailable: Boolean(env.AI),
    message: env.AI
      ? "VEDAI cloud AI is ready!"
      : "AI binding needs configuration."
  });
}

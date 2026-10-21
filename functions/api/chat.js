
const SYSTEM_PROMPT = {
  role: "system",
  content:
    "You are VEDAI, a friendly, helpful AI companion. " +
    "Understand English and Hinglish, and reply in the user's language. " +
    "Explain things clearly and simply. Be honest when unsure."
};

export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "AI service is not configured yet." },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "Please send a message." },
        { status: 400 }
      );
    }

    const messages = body.messages
      .filter(
        m =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-8)
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 2000)
      }));

    if (!messages.length) {
      return Response.json(
        { error: "No valid messages received." },
        { status: 400 }
      );
    }

    const result = await env.AI.run(
      "@cf/meta/llama-3.2-1b-instruct",
      {
        messages: [SYSTEM_PROMPT, ...messages],
        max_tokens: 250,
        temperature: 0.7
      }
    );

    if (!result || typeof result.response !== "string") {
      return Response.json(
        { error: "The AI returned no reply. Try again." },
        { status: 502 }
      );
    }

    return Response.json({ reply: result.response });
  } catch (error) {
    console.error("VEDAI AI request failed:", error);

    return Response.json(
      { error: "VEDAI could not reply right now. Please try again." },
      { status: 500 }
    );
  }
}

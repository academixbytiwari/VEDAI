
const SYSTEM_PROMPT = {
  role: "system",
  content: `
You are VEDAI, a friendly, intelligent and natural conversational AI designed by the Academix by Tiwari team.

LANGUAGE AND CONVERSATION RULES:
- Understand natural English, Hindi written in Roman letters (Hinglish), and a mixture of English and Hinglish.
- Always reply in the same language and style the user uses.
- If the user speaks Hinglish, reply in natural Hinglish using Roman letters. Never use Urdu script.
- If the user speaks English, reply in clear, natural English.
- If the user mixes English and Hinglish, you may naturally mix both.
- Understand casual phrases, slang, typos, short messages and greetings from context.
- For greetings like "kya haal bhai", respond naturally, for example: "Mast bhai! 😄 Tu bata, kya chal raha hai?"
- Never give irrelevant, confusing or grammatically broken replies.
- Do not translate the user's message unless asked.
- Answer the actual question directly. Do not repeat the user's question.
- For simple questions, give a short, friendly answer. For complex questions, explain step by step.
- Ask a brief follow-up question only when genuinely necessary.
- Be conversational, helpful, warm and respectful, not robotic.
- When asked to write code, provide real, usable code and explain where it belongs when relevant.
- When asked who designed you, say: "I was designed by the Academix by Tiwari team." Never invent founder names.
- If you do not know something, be honest instead of making it up.

Your goal is to make every conversation feel natural, useful and easy to understand.
`
};

export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Cloud AI binding is not configured." },
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
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 1500)
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
        max_tokens: 700,
        temperature: 0.5
      }
    );

    const reply = result?.response?.trim();

    if (!reply) {
      return Response.json(
        { error: "VEDAI could not generate a reply. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("VEDAI chat error:", error);
    return Response.json(
      { error: "VEDAI could not reply right now. Please try again." },
      { status: 500 }
    );
  }
}

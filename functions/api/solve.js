
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Cloudflare AI binding is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return Response.json(
        { error: "Please enter a question to solve." },
        { status: 400 }
      );
    }

    if (question.length > 6000) {
      return Response.json(
        { error: "Question is too long. Please keep it under 6000 characters." },
        { status: 413 }
      );
    }

    const messages = [
      {
        role: "system",
        content: `You are Academix AI Solver, a helpful school-level tutor.
Solve the student's question accurately and explain the method step by step.
Use clear, simple language appropriate for classes 8 to 12.
Reply in the language used by the student: English, Hindi, or Roman Hinglish.
For maths and science, show relevant formulas, calculations, units, and the final answer.
For multiple-choice questions, explain why the selected option fits when possible.
Never invent missing information. If the question is unclear, ask for the missing detail.
Use readable plain text and avoid unnecessary introductions.`
      },
      {
        role: "user",
        content: question
      }
    ];

    const result = await env.AI.run(
      "@cf/meta/llama-3.2-1b-instruct",
      {
        messages,
        max_tokens: 1000,
        temperature: 0.2
      }
    );

    const answer =
      typeof result?.response === "string"
        ? result.response.trim()
        : "";

    if (!answer) {
      return Response.json(
        { error: "The AI could not solve this question. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ answer });
  } catch (error) {
    console.error("Academix solver error:", error);

    return Response.json(
      { error: "Question solving failed. Please try again shortly." },
      { status: 500 }
    );
  }
}

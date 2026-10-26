
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Workers AI binding is not configured." },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const image = form.get("image");
    const extraQuestion = form.get("question");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json(
        { error: "Please upload a question image." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return Response.json(
        { error: "Please upload a valid image file." },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "Image must be smaller than 5 MB." },
        { status: 413 }
      );
    }

    const question =
      typeof extraQuestion === "string"
        ? extraQuestion.trim().slice(0, 2000)
        : "";

    const imageBytes = Array.from(
      new Uint8Array(await image.arrayBuffer())
    );

    const prompt = [
      "You are Academix AI, a helpful school-level tutor.",
      "Read the question in the image carefully.",
      "Solve it step by step in simple language.",
      "For maths, show formulas and calculations.",
      "For science, explain reasoning and include units.",
      "If the image is unclear, say what cannot be read.",
      question ? `Student context: ${question}` : ""
    ].filter(Boolean).join("\n");

    const result = await env.AI.run(
      "@cf/meta/llama-3.2-11b-vision-instruct",
      {
        prompt,
        image: imageBytes,
        max_tokens: 1000,
        temperature: 0.2
      }
    );

    const answer =
      typeof result?.response === "string"
        ? result.response.trim()
        : "";

    if (!answer) {
      console.error("Vision model returned no answer:", result);

      return Response.json(
        { error: "The AI returned no answer. Check Worker logs." },
        { status: 502 }
      );
    }

    return Response.json({ answer });
  } catch (error) {
    console.error("Image solver failure:", error);

    // Temporary diagnostic: expose the actual error message.
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : String(error)
      },
      { status: 500 }
    );
  }
}


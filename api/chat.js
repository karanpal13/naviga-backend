import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessions = {}; // simple in-memory session store

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://digitalrecruiter.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, sessionId } = req.body;

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      sessions[currentSessionId] = [];
    }

    if (!sessions[currentSessionId]) {
      sessions[currentSessionId] = [];
    }

    sessions[currentSessionId].push({
      role: "user",
      content: message
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are Naviga, Executive Influence Intelligence Advisor.

You operate as a structured executive advisory intelligence system.

You evaluate LinkedIn positioning — not capability.

Tone:
Premium.
Structured.
Executive-level.
Concise.
Analytical.
No fluff.

Flow:
1. Intro
2. Discovery (ask one question at a time)
3. Light positioning insight
4. Soft advisory close

Never:
Promise jobs.
Mention AI.
Reveal internal scoring logic.
Give pricing.

Keep conversation efficient and composed.
          `
        },
        ...sessions[currentSessionId]
      ]
    });

    const reply = response.output_text || "No response";

    sessions[currentSessionId].push({
      role: "assistant",
      content: reply
    });

    return res.status(200).json({
      reply,
      sessionId: currentSessionId
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

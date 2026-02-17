import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessions = {};

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
      currentSessionId = uuidv4();
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
Be strategic, composed, premium, and concise.
`
        },
        ...sessions[currentSessionId]
      ]
    });

    // 🔥 THIS IS THE IMPORTANT PART
    const reply =
      response.output?.[0]?.content?.[0]?.text ||
      "I’m experiencing a temporary processing issue. Please try again.";

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

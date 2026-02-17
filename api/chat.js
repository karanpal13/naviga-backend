import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Temporary in-memory store (MVP)
const conversations = {};

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

    let { message, sessionId } = req.body;

    // Create new session if none exists
    if (!sessionId) {
      sessionId = uuidv4();
      conversations[sessionId] = [];
    }

    // Initialize session store if missing
    if (!conversations[sessionId]) {
      conversations[sessionId] = [];
    }

    // Add user message to history
    conversations[sessionId].push({
      role: "user",
      content: message
    });

    // Call OpenAI Workflow
    const response = await openai.responses.create({
      workflow: "wf_698c1b0622a4819098fd9914c82710660397",
      input: conversations[sessionId]
    });

    const reply = response.output_text || "No response";

    // Store assistant reply
    conversations[sessionId].push({
      role: "assistant",
      content: reply
    });

    return res.status(200).json({
      reply,
      sessionId
    });

  } catch (error) {
    console.error("Workflow error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
}

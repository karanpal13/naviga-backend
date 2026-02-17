import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_ORIGIN = "https://digitalrecruiter.com";

export default async function handler(req, res) {

  // ===============================
  // CORS
  // ===============================
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message required" });

    const response = await openai.responses.create({
      workflow: "wf_YOUR_WORKFLOW_ID_HERE", // keep yours here
      input: [
        {
          role: "user",
          content: message
        }
      ]
    });

    // ===============================
    // SAFELY EXTRACT ASSISTANT TEXT
    // ===============================

    let reply = "";

    if (response.output && response.output.length > 0) {
      for (const item of response.output) {
        if (item.content) {
          for (const content of item.content) {
            if (content.text) {
              reply += content.text;
            }
          }
        }
      }
    }

    return res.status(200).json({
      reply: reply || "No response from agent"
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

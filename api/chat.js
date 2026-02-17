import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_ORIGIN = "https://digitalrecruiter.com"; // change if needed

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
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message required" });
    }

    // ===============================
    // OPENAI WORKFLOW CALL (TYPE 1 AGENT)
    // ===============================
    const response = await openai.responses.create({
      workflow: "wf_698c1b0622a4819098fd9914c82710660397016149043a87", // <-- replace
      input: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    return res.status(200).json({
      reply: response.output_text || "No response",
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

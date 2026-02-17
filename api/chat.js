import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { message } = req.body;

    const response = await openai.responses.create({
      model: "gpt-4.1",
      workflow: {
        id: "wf_698c1b0622a4819098fd9914c82710660397"
      },
      input: message
    });

    res.status(200).json({
      reply: response.output_text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

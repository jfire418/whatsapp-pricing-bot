const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ["Wedding", "Event", "Portrait", "Corporate", "General"];

async function classifyMessage(message) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: `You are a business assistant for a photography and film company.

Classify this WhatsApp message into ONE category only.

Categories: ${CATEGORIES.join(", ")}

Return ONLY the category name, nothing else.

Message: ${message}`,
      },
    ],
  });

  const raw = response.content[0].text.trim();
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase()
  );
  return match || "General";
}

async function generateReply(category) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `Write a short WhatsApp reply for a photography business.

Rules:
- 2-3 sentences only
- Warm and professional
- Encourage booking
- Do not mention AI
- We have just sent the pricing PDF

Category: ${category}`,
      },
    ],
  });

  return response.content[0].text.trim();
}

module.exports = { classifyMessage, generateReply };

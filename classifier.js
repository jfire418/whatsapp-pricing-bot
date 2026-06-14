const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ["Wedding", "Event", "Portrait", "Corporate", "General", "Smalltalk"];

async function classifyMessage(message) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: `You are a assistant for a photography and film company.

Classify this WhatsApp message into ONE category only.

Categories: Wedding, Event, Portrait, Corporate, General, Smalltalk

Use "Smalltalk" for greetings, how are you, thanks, ok, bye, and any chat that is NOT about photography services or pricing.

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

async function generateReply(category, message) {
  if (category === "Smalltalk") {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `You are a friendly human assistant for a photography business chatting on WhatsApp.

Reply naturally to this message like a real person would — casual, warm, short.
- Match their energy (if they say "hi" just say "Hey! 😊" or similar)
- Do NOT mention AI, do NOT be robotic
- If they ask how you are, respond like a human would
- Keep it to 1-2 sentences max

Message: ${message}`,
        },
      ],
    });
    return response.content[0].text.trim();
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `You are a friendly human assistant for a photography business on WhatsApp.

Write a natural, warm reply. Rules:
- Sound like a real person texting, not a corporate bot
- 2-3 sentences max
- Encourage them to book or ask more questions
- Do NOT mention AI or that you sent a PDF (they'll see it)
- No stiff formal language

Category: ${category}`,
      },
    ],
  });

  return response.content[0].text.trim();
}

module.exports = { classifyMessage, generateReply };

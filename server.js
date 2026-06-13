require("dotenv").config();
const express = require("express");
const { classifyMessage, generateReply } = require("./classifier");
const { getPdfUrl } = require("./drive");
const { sendDocument, sendText } = require("./whatsapp");

const app = express();
app.use(express.json());

// Webhook verification — Meta calls this once when you register the webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming WhatsApp messages
app.post("/webhook", async (req, res) => {
  // Acknowledge immediately — Meta requires a 200 within 5 seconds
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const messageObj = change?.value?.messages?.[0];

    if (!messageObj || messageObj.type !== "text") return;

    const from = messageObj.from;
    const text = messageObj.text.body;

    console.log(`[${from}] ${text}`);

    // 1. Classify
    const category = await classifyMessage(text);
    console.log(`Category: ${category}`);

    // 2. Get PDF URL from Google Drive
    const pdfUrl = getPdfUrl(category);

    // 3. Send PDF
    await sendDocument(
      from,
      pdfUrl,
      "Here is our pricing guide. Let us know your date so we can assist you further."
    );

    // 4. Send warm follow-up message
    const reply = await generateReply(category);
    await sendText(from, reply);

    console.log(`Replied to ${from} with ${category} pricing`);
  } catch (err) {
    console.error("Error handling message:", err.message);
  }
});

app.get("/", (req, res) => res.send("WhatsApp bot is running."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

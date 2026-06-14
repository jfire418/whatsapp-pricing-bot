require("dotenv").config();
const express = require("express");
const { chat, extractPdfCategory, cleanReply } = require("./classifier");
const { getHistory, addMessage } = require("./conversation");
const { getPdfUrl } = require("./drive");
const { sendDocument, sendText } = require("./whatsapp");

const app = express();
app.use(express.json());

const recentLogs = [];
const origLog = console.log.bind(console);
const origErr = console.error.bind(console);
console.log = (...args) => { recentLogs.push(args.join(" ")); if (recentLogs.length > 50) recentLogs.shift(); origLog(...args); };
console.error = (...args) => { recentLogs.push("ERROR: " + args.join(" ")); if (recentLogs.length > 50) recentLogs.shift(); origErr(...args); };

app.get("/logs", (req, res) => res.json(recentLogs));

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "pricingbot2024";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming WhatsApp messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const messageObj = change?.value?.messages?.[0];

    if (!messageObj || messageObj.type !== "text") return;

    const from = messageObj.from;
    const text = messageObj.text.body;

    console.log(`[${from}] ${text}`);

    // Get conversation history and generate reply
    const history = getHistory(from);
    const reply = await chat(history, text);

    console.log(`Reply: ${reply}`);

    // Save to conversation history
    addMessage(from, "user", text);
    addMessage(from, "assistant", reply);

    // Check if Claude decided to send a PDF
    const pdfCategory = extractPdfCategory(reply);
    const cleanedReply = cleanReply(reply);

    if (pdfCategory) {
      const pdfUrl = getPdfUrl(pdfCategory);
      await sendDocument(from, pdfUrl, "Here's our pricing guide 📸");
      console.log(`Sent ${pdfCategory} PDF to ${from}`);
    }

    if (cleanedReply) {
      await sendText(from, cleanedReply);
    }

    console.log(`Replied to ${from}`);
  } catch (err) {
    console.error("Error handling message:", err.message);
    if (err.response) {
      console.error("API error details:", JSON.stringify(err.response.data));
    }
  }
});

app.get("/debug", (req, res) => {
  res.json({
    verify_token_set: !!process.env.WHATSAPP_VERIFY_TOKEN,
    verify_token_length: (process.env.WHATSAPP_VERIFY_TOKEN || "").length,
    anthropic_set: !!process.env.ANTHROPIC_API_KEY,
    phone_id_set: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
  });
});

app.get("/", (req, res) => res.send("WhatsApp bot is running."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

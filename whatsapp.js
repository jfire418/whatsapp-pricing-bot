const axios = require("axios");

const BASE_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
const HEADERS = {
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  "Content-Type": "application/json",
};

async function sendDocument(to, pdfUrl, caption) {
  await axios.post(
    `${BASE_URL}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        link: pdfUrl,
        caption,
        filename: "pricing-guide.pdf",
      },
    },
    { headers: HEADERS }
  );
}

async function sendText(to, text) {
  await axios.post(
    `${BASE_URL}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    { headers: HEADERS }
  );
}

module.exports = { sendDocument, sendText };

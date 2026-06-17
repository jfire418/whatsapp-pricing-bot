// Persistent conversation store keyed by phone number.
// Backed by a JSON file so chats survive a server restart / Railway redeploy.
// On Railway, set CONVERSATIONS_PATH to a mounted volume (e.g. /data/conversations.json)
// so the file persists across deploys — otherwise it lives next to the code and is
// wiped when a fresh container is built.
const fs = require("fs");
const path = require("path");

const STORE_PATH = process.env.CONVERSATIONS_PATH || path.join(__dirname, "conversations.json");
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // forget a client after 24h of silence
const MAX_MESSAGES = 20;

// { [phone]: { messages: [{ role, content }], updatedAt: number } }
let conversations = {};

function load() {
  try {
    conversations = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) || {};
    pruneExpired();
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Failed to load conversation store:", err.message);
    conversations = {};
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(conversations));
    } catch (err) {
      console.error("Failed to save conversation store:", err.message);
    }
  }, 1000);
}

function isExpired(session) {
  return !session || Date.now() - (session.updatedAt || 0) > SESSION_TTL_MS;
}

function pruneExpired() {
  let changed = false;
  for (const phone of Object.keys(conversations)) {
    if (isExpired(conversations[phone])) {
      delete conversations[phone];
      changed = true;
    }
  }
  if (changed) scheduleSave();
}

function getHistory(phone) {
  if (isExpired(conversations[phone])) {
    conversations[phone] = { messages: [], updatedAt: Date.now() };
    scheduleSave();
  }
  return conversations[phone].messages;
}

function addMessage(phone, role, content) {
  const messages = getHistory(phone);
  messages.push({ role, content });
  if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
  conversations[phone].updatedAt = Date.now();
  scheduleSave();
}

// Random delay between 15-75 seconds — unpredictable like a real person
function getDelay(phone) {
  const min = 15, max = 75;
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function clearHistory(phone) {
  delete conversations[phone];
  scheduleSave();
}

load();

module.exports = { getHistory, addMessage, getDelay, clearHistory };

// In-memory conversation store keyed by phone number
const conversations = {};

function getHistory(phone) {
  if (!conversations[phone]) conversations[phone] = [];
  return conversations[phone];
}

function addMessage(phone, role, content) {
  const history = getHistory(phone);
  history.push({ role, content });
  // Keep last 20 messages to avoid token bloat
  if (history.length > 20) history.splice(0, history.length - 20);
}

function clearHistory(phone) {
  conversations[phone] = [];
}

module.exports = { getHistory, addMessage, clearHistory };

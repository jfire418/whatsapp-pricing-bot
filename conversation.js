// In-memory conversation store keyed by phone number
const conversations = {};

function getHistory(phone) {
  if (!conversations[phone]) conversations[phone] = [];
  return conversations[phone];
}

function addMessage(phone, role, content) {
  const history = getHistory(phone);
  history.push({ role, content });
  if (history.length > 20) history.splice(0, history.length - 20);
}

// Random delay between 15-75 seconds — unpredictable like a real person
function getDelay(phone) {
  const min = 15, max = 75;
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function clearHistory(phone) {
  conversations[phone] = [];
}

module.exports = { getHistory, addMessage, getDelay, clearHistory };

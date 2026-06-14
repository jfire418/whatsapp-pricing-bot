// In-memory conversation store keyed by phone number
const conversations = {};
const messageCounts = {};

// Delay pattern in seconds: 60, 15, 30, 10, then repeats
const DELAY_PATTERN = [60, 15, 30, 10];

function getHistory(phone) {
  if (!conversations[phone]) conversations[phone] = [];
  return conversations[phone];
}

function addMessage(phone, role, content) {
  const history = getHistory(phone);
  history.push({ role, content });
  if (history.length > 20) history.splice(0, history.length - 20);
}

function getDelay(phone) {
  if (!messageCounts[phone]) messageCounts[phone] = 0;
  const delay = DELAY_PATTERN[messageCounts[phone] % DELAY_PATTERN.length];
  messageCounts[phone]++;
  return delay * 1000;
}

function clearHistory(phone) {
  conversations[phone] = [];
  messageCounts[phone] = 0;
}

module.exports = { getHistory, addMessage, getDelay, clearHistory };

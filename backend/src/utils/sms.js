const twilio = require('twilio');

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM;

let client = null;
if (sid && token) client = twilio(sid, token);

async function sendSms(to, body) {
  if (!client || !from) {
    console.warn('[SMS] Twilio not configured, skip send to', to);
    return;
  }
  await client.messages.create({ from, to, body });
}

module.exports = { sendSms };

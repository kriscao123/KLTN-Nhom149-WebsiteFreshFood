const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const emailFrom = process.env.EMAIL_FROM || smtpUser;

let transporter = null;
if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass }
  });
}

async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.warn('[MAIL] SMTP not configured, skip send to', to);
    return;
  }
  await transporter.sendMail({ from: emailFrom, to, subject, html });
}

module.exports = { sendEmail };

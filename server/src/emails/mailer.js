// src/utils/mailer.js
// Gmail-only mailer (no host/port/secure). Keeps templates flow as-is.
// Exposes: sendMail, sendTemplate, transporter, and a convenience sendEmail().

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import templates from "./templates.js";

dotenv.config();

const {
  EMAIL_USER,
  EMAIL_PASS,       // preferred (matches your reference)
  EMAIL_PASSWORD,   // fallback (matches your earlier code)
  EMAIL_FROM,
} = process.env;

const GMAIL_PASS = EMAIL_PASS || EMAIL_PASSWORD;

// Create a simple Gmail transporter (no host/port/secure)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: GMAIL_PASS, // Gmail App Password
  },
});

// Optional: light verification (won’t crash app if it fails)


/** Core sender (throws on error; same behavior as your previous code) */
export async function sendMail({ to, subject, text, html, from } = {}) {
  if (!to) throw new Error("sendMail error: 'to' is required");
  if (!subject) throw new Error("sendMail error: 'subject' is required");

  if (!EMAIL_USER || !GMAIL_PASS) {
    throw new Error("sendMail error: EMAIL_USER or EMAIL_PASS/EMAIL_PASSWORD not set");
  }

  const defaultFrom = from || EMAIL_FROM || EMAIL_USER;

  const mailOptions = {
    from: defaultFrom,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: messageId=${info?.messageId || "n/a"}`);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err?.message || err);
    throw err;
  }
}

/** Template sender (keeps your `templates` integration & structure) */
export async function sendTemplate(templateKey, to, params = {}, from) {
  if (!to) throw new Error("sendTemplate error: 'to' is required");
  if (!templateKey) throw new Error("sendTemplate error: 'templateKey' is required");

  const toField = Array.isArray(to) ? to.join(",") : to;

  let tmplFunc;
  if (typeof templateKey === "function") {
    tmplFunc = templateKey;
  } else if (typeof templateKey === "string" && templates && typeof templates[templateKey] === "function") {
    tmplFunc = templates[templateKey];
  } else {
    throw new Error(`sendTemplate error: unknown template '${templateKey}'`);
  }

  const template = tmplFunc(params);
  if (!template || typeof template !== "object") {
    throw new Error("sendTemplate error: template function must return an object");
  }

  const { subject, text, html } = template;
  if (!subject) throw new Error("sendTemplate error: template did not provide a subject");
  if (!html && !text) throw new Error("sendTemplate error: template did not provide html or text");

  try {
    const info = await sendMail({ to: toField, subject, text, html, from });
    console.log(`Template '${template.templateKey || templateKey}' email sent to ${toField}: messageId=${info?.messageId || "n/a"}`);
    return info;
  } catch (err) {
    console.error(`sendTemplate error sending '${template.templateKey || templateKey}' to ${toField}:`, err?.message || err);
    throw err;
  }
}

/**
 * Convenience helper that mimics your reference signature & boolean return:
 * sendEmail({ email, subject, text, html }) -> boolean
 * Internally uses sendMail to keep one code path.
 */
export async function sendEmail({ email, subject, text, html, from } = {}) {
  try {
    if (!email || !subject || (!text && !html)) {
      console.error("sendEmail: missing required parameters");
      return false;
    }
    await sendMail({ to: email, subject, text, html, from });
    return true;
  } catch (err) {
    console.error("sendEmail failed:", err?.message || err);
    return false;
  }
}

export { transporter };
export default { sendMail, sendTemplate, sendEmail };

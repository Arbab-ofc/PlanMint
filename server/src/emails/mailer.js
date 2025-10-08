import nodemailer from "nodemailer";
import dotenv from "dotenv";
import templates from "./templates.js";
import dns from "dns";

dotenv.config();

// Prefer IPv4 first to avoid IPv6 timeout issues on some hosts (Render, etc.)
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch { /* ignore */ }

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  NODE_ENV,
  EMAIL_SECURE, // optional: "true" | "false" to override secure
  MAIL_DEBUG,   // optional: "true" to enable nodemailer debug logs
} = process.env;

const isProd = NODE_ENV === "production";
const isGmail = String(EMAIL_HOST || "").toLowerCase().includes("gmail");

// Default to 587 unless you set EMAIL_PORT; for Gmail in production prefer 465 (set via env)
const port = EMAIL_PORT ? Number(EMAIL_PORT) : 587;

// If EMAIL_SECURE is set, respect it; else infer from port (465 => secure)
const secure = typeof EMAIL_SECURE === "string"
  ? EMAIL_SECURE === "true"
  : port === 465;

// In production, keep TLS strict; in dev, allow self-signed to ease local testing
const tls = isProd ? {} : { rejectUnauthorized: false };

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "Mailer warning: EMAIL_HOST, EMAIL_PORT, EMAIL_USER or EMAIL_PASSWORD is not set. Emails may fail to send."
  );
}

// Transporter tuned for cloud deployments
const transporter = nodemailer.createTransport({
  host: isGmail ? "smtp.gmail.com" : (EMAIL_HOST || "localhost"),
  port,
  secure,                 // true for 465, false for 587 (STARTTLS)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  pool: true,             // connection pooling
  maxConnections: 3,
  maxMessages: 50,
  // Timeouts to avoid long hangs
  connectionTimeout: 30000,
  socketTimeout: 30000,
  greetingTimeout: 20000,
  // When not using implicit TLS (465), require STARTTLS
  requireTLS: !secure,
  tls,
  // Optional diagnostics
  logger: MAIL_DEBUG === "true",
  debug: MAIL_DEBUG === "true",
});

// Quick visibility (remove if you don’t want secrets echoed)
console.log(EMAIL_FROM, EMAIL_USER, EMAIL_HOST, EMAIL_PORT, NODE_ENV, secure, tls);

transporter.verify().then(
  () => {
    console.log("Mailer: SMTP transporter is ready");
  },
  (err) => {
    console.warn("Mailer: SMTP transporter verification failed:", err && err.message);
  }
);

export async function sendMail({ to, subject, text, html, from } = {}) {
  if (!to) throw new Error("sendMail error: 'to' is required");
  if (!subject) throw new Error("sendMail error: 'subject' is required");

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
    console.log(`Email sent to ${to}: messageId=${info.messageId || "n/a"}`);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err && err.message ? err.message : err);
    throw err;
  }
}

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
    console.log(`Template '${template.templateKey || templateKey}' email sent to ${toField}: messageId=${info.messageId || "n/a"}`);
    return info;
  } catch (err) {
    console.error(`sendTemplate error sending '${template.templateKey || templateKey}' to ${toField}:`, err && err.message ? err.message : err);
    throw err;
  }
}

export { transporter };
export default sendMail;

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import templates from "./templates.js";

dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  NODE_ENV,
  EMAIL_SECURE, // optional override: "true" | "false"
} = process.env;

const isGmail = String(EMAIL_HOST || "").toLowerCase().includes("gmail");
const port = EMAIL_PORT ? Number(EMAIL_PORT) : (isGmail ? 587 : 587);

// If EMAIL_SECURE is explicitly set, respect it; otherwise fall back to port rule
const secure = typeof EMAIL_SECURE === "string"
  ? EMAIL_SECURE === "true"
  : port === 465;

// In production, leave TLS defaults; in dev, allow self-signed to ease local testing
const tls =
  NODE_ENV === "production"
    ? {}
    : { rejectUnauthorized: false };

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "Mailer warning: EMAIL_HOST, EMAIL_PORT, EMAIL_USER or EMAIL_PASSWORD is not set. Emails may fail to send."
  );
}

/**
 * Transporter tuned for cloud deployments:
 * - Uses connection pooling
 * - Adds reasonable timeouts to avoid hanging builds
 * - Sets requireTLS when using STARTTLS ports (e.g. 587)
 */
const transporter = nodemailer.createTransport({
  host: isGmail ? "smtp.gmail.com" : (EMAIL_HOST || "localhost"),
  port,
  secure, // true for 465, false for 587
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  // Timeouts to avoid indefinite waits on providers
  connectionTimeout: 20000, // 20s
  socketTimeout: 20000,     // 20s
  greetingTimeout: 20000,   // 20s
  // When using port 587 (STARTTLS), ensure TLS is required
  requireTLS: !secure,
  tls,
});

console.log(EMAIL_FROM, EMAIL_USER, EMAIL_HOST, EMAIL_PORT, NODE_ENV, secure, tls, EMAIL_PASSWORD);

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
    console.error(
      `Failed to send email to ${to}:`,
      err && err.message ? err.message : err
    );
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
    console.log(
      `Template '${template.templateKey || templateKey}' email sent to ${toField}: messageId=${info.messageId || "n/a"}`
    );
    return info;
  } catch (err) {
    console.error(
      `sendTemplate error sending '${template.templateKey || templateKey}' to ${toField}:`,
      err && err.message ? err.message : err
    );
    throw err;
  }
}

export { transporter };
export default sendMail;

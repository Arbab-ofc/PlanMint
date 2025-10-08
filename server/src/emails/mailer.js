// mailer.js (ready for deployment; keeps your public API the same)

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import templates from "./templates.js";
import dns from "dns";

dotenv.config();

// Prefer IPv4 in cloud environments to avoid IPv6 egress issues
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  NODE_ENV,
  EMAIL_SECURE,            // NEW: allow explicit secure toggle via env
  MAIL_VERIFY_ON_BOOT,     // NEW: optionally skip transporter.verify() in prod
} = process.env;

// Port & secure resolution
const port = EMAIL_PORT ? Number(EMAIL_PORT) : 587;

// If EMAIL_SECURE is provided, use it; otherwise infer from port (465 => true)
const secure =
  typeof EMAIL_SECURE !== "undefined"
    ? String(EMAIL_SECURE).toLowerCase() === "true"
    : port === 465;

// TLS:
//  - For production, leave TLS object empty (default validation).
//  - For non-prod, we keep your previous relaxed TLS to ease local testing.
const tls =
  NODE_ENV === "production"
    ? {}
    : { rejectUnauthorized: false };

// Build transport options with helpful timeouts & STARTTLS requirement when secure=false
const transportOptions = {
  host: EMAIL_HOST || "localhost",
  port,
  secure, // true => implicit TLS (465), false => STARTTLS (587)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  pool: true,
  // Robust timeouts (ms)
  connectionTimeout: 20000, // connect phase
  greetingTimeout: 20000,   // waiting for the greeting after connection
  socketTimeout: 30000,     // overall inactivity on the socket
  // On 587 we require STARTTLS; on 465 (secure=true) this is not used
  ...(secure ? {} : { requireTLS: true }),
  tls,
};

// Sanity warning if required env is missing
if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "Mailer warning: EMAIL_HOST, EMAIL_PORT, EMAIL_USER or EMAIL_PASSWORD is not set. Emails may fail to send."
  );
}

// Create transporter
const transporter = nodemailer.createTransport(transportOptions);

// Optional verify (you can disable in prod with MAIL_VERIFY_ON_BOOT=false)
const shouldVerify =
  (MAIL_VERIFY_ON_BOOT ?? "true").toLowerCase() === "true";

console.log(
  "[Mailer] host=%s port=%s secure=%s node_env=%s",
  EMAIL_HOST,
  port,
  secure,
  NODE_ENV
);

if (shouldVerify) {
  transporter.verify().then(
    () => {
      console.log("Mailer: SMTP transporter is ready");
    },
    (err) => {
      console.warn(
        "Mailer: SMTP transporter verification failed:",
        err && err.message
      );
    }
  );
}

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

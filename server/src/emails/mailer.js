// mailer.js — Gmail service only (no host/port/secure), ready for deployment

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import templates from "./templates.js";
import dns from "dns";

dotenv.config();

// Prefer IPv4 to avoid IPv6 egress issues on some hosts
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const {
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  NODE_ENV,
  MAIL_VERIFY_ON_BOOT, // optional: set to "false" to skip verify on boot
} = process.env;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "Mailer warning: EMAIL_USER or EMAIL_PASSWORD is not set. Emails may fail to send."
  );
}

// Create transporter using Gmail service (no host/port/secure)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,       // e.g. yourgmail@gmail.com
    pass: EMAIL_PASSWORD,   // 16-character App Password
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

const shouldVerify =
  (MAIL_VERIFY_ON_BOOT ?? "true").toLowerCase() === "true";

console.log(
  "[Mailer] service=gmail user=%s node_env=%s verifyOnBoot=%s",
  EMAIL_USER,
  NODE_ENV,
  shouldVerify
);

if (shouldVerify) {
  transporter.verify().then(
    () => {
      console.log("Mailer: SMTP transporter is ready");
      console.log(shouldVerify)
    },
    (err) => {
      console.log(shouldVerify)
      console.warn("Mailer: SMTP transporter verification failed:", err && err.message);
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

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
} = process.env;

const port = EMAIL_PORT ? Number(EMAIL_PORT) : 587;
const secure = port === 465;

const tls =
  NODE_ENV === "production"
    ? undefined
    : { rejectUnauthorized: false };

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "Mailer warning: EMAIL_HOST, EMAIL_PORT, EMAIL_USER or EMAIL_PASSWORD is not set. Emails may fail to send."
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "localhost",
  port,
  secure,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  pool: true,
  tls
});

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
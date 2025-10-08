// src/utils/mailer.js
// SendGrid-based mailer (HTTPS; works on Render).
// Preserves your templates flow & public API:
//   - sendMail({ to, subject, text, html, from })
//   - sendTemplate(templateKey, to, params = {}, from)
//   - sendEmail({ email, subject, text, html, from })
// Default export bundles the three functions.

import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import templates from "./templates.js";

dotenv.config();

const {
  SENDGRID_API_KEY,
  EMAIL_FROM,       // default sender (must be verified in SendGrid)
  REPLY_TO,         // optional
} = process.env;

// Init SendGrid
if (!SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY not set — emails will fail.");
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/** Internal: normalize recipients (array/string) -> string[] */
function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) return to.filter(Boolean);
  if (typeof to === "string") {
    // support comma-separated string
    return to.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/** Core sender (throws on error) */
export async function sendMail({ to, subject, text, html, from } = {}) {
  if (!to) throw new Error("sendMail error: 'to' is required");
  if (!subject) throw new Error("sendMail error: 'subject' is required");
  if (!SENDGRID_API_KEY) throw new Error("sendMail error: SENDGRID_API_KEY not set");

  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) throw new Error("sendMail error: no valid recipients");

  const defaultFrom = from || EMAIL_FROM;
  if (!defaultFrom) throw new Error("sendMail error: EMAIL_FROM not set (and no 'from' provided)");

  const msg = {
    to: recipients,
    from: defaultFrom,
    subject,
    text,
    html,
    // Optional quality-of-life fields:
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
  };

  try {
    const [res] = await sgMail.send(msg);
    console.log(`✅ Email sent to ${recipients.join(", ")}: status=${res?.statusCode ?? "n/a"}`);
    return res;
  } catch (err) {
    const reason = err?.response?.body?.errors?.map(e => e.message).join("; ") || err?.message || String(err);
    console.error(`❌ Failed to send email to ${recipients.join(", ")}: ${reason}`);
    throw new Error(reason);
  }
}

/** Template sender (keeps your `templates` integration & structure) */
export async function sendTemplate(templateKey, to, params = {}, from) {
  if (!to) throw new Error("sendTemplate error: 'to' is required");
  if (!templateKey) throw new Error("sendTemplate error: 'templateKey' is required");

  // Resolve template function
  let tmplFunc;
  if (typeof templateKey === "function") {
    tmplFunc = templateKey;
  } else if (typeof templateKey === "string" && templates && typeof templates[templateKey] === "function") {
    tmplFunc = templates[templateKey];
  } else {
    throw new Error(`sendTemplate error: unknown template '${templateKey}'`);
  }

  // Expect { subject, text?, html? }
  const template = tmplFunc(params);
  if (!template || typeof template !== "object") {
    throw new Error("sendTemplate error: template function must return an object");
  }

  const { subject, text, html } = template;
  if (!subject) throw new Error("sendTemplate error: template did not provide a subject");
  if (!html && !text) throw new Error("sendTemplate error: template did not provide html or text");

  try {
    const info = await sendMail({ to, subject, text, html, from });
    console.log(
      `✅ Template '${template.templateKey || templateKey}' email sent to ${Array.isArray(to) ? to.join(",") : to}: status=${info?.statusCode ?? "n/a"}`
    );
    return info;
  } catch (err) {
    console.error(
      `❌ sendTemplate error sending '${template.templateKey || templateKey}' to ${Array.isArray(to) ? to.join(",") : to}:`,
      err?.message || err
    );
    throw err;
  }
}

/**
 * Convenience helper:
 * sendEmail({ email, subject, text, html, from }) -> boolean
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

export default { sendMail, sendTemplate, sendEmail };

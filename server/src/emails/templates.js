function wrapHtml({ title, preheader, body, accent }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0.08); }
        70% { transform: scale(1.03); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0.08); }
      }
      body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:#f3f4f6; margin:0; padding:30px; color:#0f172a; }
      .outer { max-width:700px; margin:0 auto; }
      .card { background:#fff; border-radius:12px; padding:28px; box-shadow:0 6px 24px rgba(15,23,42,0.06); animation:fadeInUp .38s ease both; overflow:hidden; }
      .banner { height:8px; width:100%; border-radius:8px; background: linear-gradient(90deg, ${accent} 0%, rgba(0,0,0,0.06) 100%); margin-bottom:18px; }
      .title { font-size:20px; font-weight:700; color:#0f172a; margin-bottom:6px; }
      .pre { color:#64748b; font-size:13px; margin-bottom:18px; }
      .body { font-size:15px; line-height:1.5; color:#0f172a; }
      .otp { display:inline-block; margin:18px 0; padding:14px 22px; font-size:20px; font-weight:700; letter-spacing:6px; color:#fff; border-radius:10px; background:${accent}; animation:pulse 2.2s ease infinite; }
      .btn { display:inline-block; background:${accent}; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none; margin-top:12px; }
      .muted { color:#94a3b8; font-size:13px; margin-top:18px; }
      .footer { color:#9aa6b2; font-size:12px; margin-top:22px; text-align:center; }
      .small { font-size:13px; color:#334155; margin-top:8px; }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="card">
        <div class="banner" aria-hidden="true"></div>
        <div class="title">${title}</div>
        <div class="pre">${preheader}</div>
        <div class="body">${body}</div>
        <div class="footer">If you didn't request this, you can safely ignore this email.</div>
      </div>
    </div>
  </body>
</html>`;
}

export function forgotPasswordOTP({ name = "User", otp, expiryMinutes = 15 } = {}) {
  const subject = "Reset your PlanMint password";
  const text = `${name},\n\nUse the following OTP to reset your password: ${otp}\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, ignore this email.`;
  const body = `
    <div>Hi ${name},</div>
    <div class="small" style="margin-top:10px;">A password reset was requested for your account. Use the code below to continue. It expires in ${expiryMinutes} minutes.</div>
    <div class="otp" role="textbox" aria-label="One time password">${otp}</div>
    <div class="muted">If you didn't request a password reset, no further action is required.</div>
  `;
  
  const html = wrapHtml({ title: subject, preheader: `Reset your password — code expires in ${expiryMinutes} minutes`, body, accent: "#ef4444" });
  return { templateKey: "forgotPasswordOTP", subject, text, html };
}

export function resendOTP({ name = "User", otp, expiryMinutes = 15 } = {}) {
  const subject = "Your PlanMint verification code (resend)";
  const text = `${name},\n\nYour verification code: ${otp}\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, ignore this email.`;
  const body = `
    <div>Hi ${name},</div>
    <div class="small" style="margin-top:10px;">You requested your verification code again. Use it to complete verification. It will expire in ${expiryMinutes} minutes.</div>
    <div class="otp" role="textbox" aria-label="One time password">${otp}</div>
    <div class="muted">Did you not request this? Please ignore this email.</div>
  `;
  const html = wrapHtml({ title: subject, preheader: `Verification code — expires in ${expiryMinutes} minutes`, body, accent: "#f59e0b" });
  return { templateKey: "resendOTP", subject, text, html };
}

export function verifyEmailOTP({ name = "User", otp, expiryMinutes = 15 } = {}) {
  const subject = "Verify your PlanMint email";
  const text = `${name},\n\nVerify your email with this code: ${otp}\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, ignore this email.`;
  const body = `
    <div>Hi ${name},</div>
    <div class="small" style="margin-top:10px;">Welcome to PlanMint — please verify your email using the code below. It expires in ${expiryMinutes} minutes.</div>
    <div class="otp" role="textbox" aria-label="One time password">${otp}</div>
    <div class="muted">Thanks for joining PlanMint.</div>
  `;
  const html = wrapHtml({ title: subject, preheader: `Email verification code — expires in ${expiryMinutes} minutes`, body, accent: "#10b981" });
  return { templateKey: "verifyEmailOTP", subject, text, html };
}

export default {
  forgotPasswordOTP,
  resendOTP,
  verifyEmailOTP,
};
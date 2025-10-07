
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function VerifyEmail() {
  const nav = useNavigate();
  const loc = useLocation();
  const { setUser, refresh } = useUser();

  const initialEmail = (loc.state?.email || "").toString().trim().toLowerCase();

  const [email, setEmail] = React.useState(initialEmail);
  const [otp, setOtp] = React.useState("");
  const [busyVerify, setBusyVerify] = React.useState(false);
  const [busyResend, setBusyResend] = React.useState(false);

 
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const canResend = EMAIL_REGEX.test(email) && cooldown === 0 && !busyResend;

  async function onVerify(e) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) return toast.error("Please enter a valid email.");
    if (!otp.trim()) return toast.error("Please enter the OTP.");
    setBusyVerify(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: otp.trim() });
      const msg = res?.data?.message || "Email verified successfully!";
      const user = res?.data?.data?.user || res?.data?.user || null;
      if (user) setUser(user);
      toast.success(msg);
      try { await refresh(); } catch {}
      nav("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Verification failed. Try again.");
    } finally {
      setBusyVerify(false);
    }
  }

  async function onResend() {
    if (!EMAIL_REGEX.test(email)) return toast.error("Enter a valid email first.");
    setBusyResend(true);
    try {
      const res = await api.post("/auth/resend-otp", { email });
      const msg = res?.data?.message || "Verification code sent! Check your inbox.";
      toast.success(msg);
      setCooldown(60); 
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to resend code.");
    } finally {
      setBusyResend(false);
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent),radial-gradient(50%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute inset-0 animate-slow-pan bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl animate-orb" />
        <div className="absolute -bottom-32 -right-20 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl animate-orb-delayed" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />
          <div className="px-6 pt-8">
            <Link to="/" className="block text-center text-3xl font-extrabold tracking-tight text-slate-100">
              PlanMint
            </Link>
            <p className="mt-2 text-center text-sm text-slate-400">
              Enter your email and the 6-digit code we sent.
            </p>
          </div>

          <form onSubmit={onVerify} className="px-6 pb-8 pt-6 space-y-4">
            
            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                <span className="pl-4 text-slate-400">
                  <FaEnvelope size={16} />
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-sm mb-1 text-slate-300">OTP Code</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                <span className="pl-4 text-slate-400">
                  <FaKey size={16} />
                </span>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500 tracking-widest"
                />
              </div>
            </div>

            
            <button
              disabled={busyVerify}
              className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <span className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/15 transition-colors" />
              <FaCheckCircle className={`transition-transform ${busyVerify ? "animate-pulse" : "group-hover:-translate-y-0.5"}`} />
              {busyVerify ? "Verifying..." : "Verify Email"}
            </button>

            
            <button
              type="button"
              onClick={onResend}
              disabled={!canResend}
              className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/70 text-sky-300 px-5 py-3.5 font-semibold hover:text-white hover:bg-sky-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              title={!EMAIL_REGEX.test(email) ? "Enter a valid email first" : cooldown ? `Wait ${cooldown}s` : "Send a new code"}
            >
              <span className="absolute inset-0 -z-10 rounded-2xl bg-sky-400/0 group-hover:bg-sky-400/10 transition-colors" />
              <FaPaperPlane />
              {busyResend ? "Sending..." : cooldown ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>

            <div className="text-center text-xs text-slate-400">
              Didn’t receive the email? Check your spam folder.
            </div>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Need an account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">
            Sign up
          </Link>
        </p>
      </div>

      
      <style>
        {`
          @keyframes slow-pan {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-slow-pan { animation: slow-pan 14s ease-in-out infinite; }

          @keyframes orb {
            0%,100% { transform: translate(0,0) scale(1); opacity: .9; }
            50% { transform: translate(10px,-10px) scale(1.05); opacity: 1; }
          }
          .animate-orb { animation: orb 12s ease-in-out infinite; }
          .animate-orb-delayed { animation: orb 16s ease-in-out infinite; animation-delay: 0.8s; }
        `}
      </style>
    </div>
  );
}

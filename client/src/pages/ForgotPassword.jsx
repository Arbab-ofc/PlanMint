import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPaperPlane,
  FaKey,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../utils/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPassword() {
  const nav = useNavigate();
  const loc = useLocation();
  const initialEmail = (loc.state?.email || "").toString().trim().toLowerCase();

  
  const [step, setStep] = React.useState(1);

  
  const [email, setEmail] = React.useState(initialEmail);
  const [busyOtp, setBusyOtp] = React.useState(false);

  
  const [otp, setOtp] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [busyReset, setBusyReset] = React.useState(false);

  async function onGenerateOTP(e) {
    e.preventDefault();
    const eaddr = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(eaddr)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setBusyOtp(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: eaddr });
      const msg =
        res?.data?.message ||
        "If an account exists with this email, a password reset code has been sent.";
      toast.success(msg);
      setStep(2); 
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to send reset code.");
    } finally {
      setBusyOtp(false);
    }
  }

  async function onReset(e) {
    e.preventDefault();
    const eaddr = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(eaddr)) return toast.error("Enter a valid email.");
    if (!otp.trim()) return toast.error("Enter the OTP.");
    if (!newPassword) return toast.error("Enter new password.");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

    setBusyReset(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: eaddr,
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });
      const msg = res?.data?.message || "Password reset successfully!";
      toast.success(msg);
      nav("/login", { replace: true, state: { email: eaddr } });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Reset failed. Try again.");
    } finally {
      setBusyReset(false);
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
              {step === 1
                ? "Enter your email to get a reset code."
                : "Enter the code and set a new password."}
            </p>
          </div>

          
          {step === 1 && (
            <form onSubmit={onGenerateOTP} className="px-6 pb-8 pt-6 space-y-4">
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

              <button
                disabled={busyOtp}
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/70 text-sky-300 px-5 py-3.5 font-semibold hover:text-white hover:bg-sky-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <span className="absolute inset-0 -z-10 rounded-2xl bg-sky-400/0 group-hover:bg-sky-400/10 transition-colors" />
                <FaPaperPlane className={`${busyOtp ? "animate-pulse" : ""}`} />
                {busyOtp ? "Sending code..." : "Generate OTP"}
              </button>
            </form>
          )}

          
          {step === 2 && (
            <form onSubmit={onReset} className="px-6 pb-8 pt-6 space-y-4">
              
              <div>
                <label className="block text-sm mb-1 text-slate-300">Email</label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900">
                  <span className="pl-4 text-slate-400">
                    <FaEnvelope size={16} />
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm mb-1 text-slate-300">OTP Code</label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900">
                  <span className="pl-4 text-slate-400">
                    <FaKey size={16} />
                  </span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 tracking-widest"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm mb-1 text-slate-300">New Password</label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900">
                  <span className="pl-4 text-slate-400">
                    <FaLock size={16} />
                  </span>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="pr-4 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              
              <div>
                <label className="block text-sm mb-1 text-slate-300">Confirm Password</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900">
                  <span className="pl-4 text-slate-400">
                    <FaLock size={16} />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="pr-4 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                disabled={busyReset}
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <span className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/15 transition-colors" />
                <FaCheckCircle className={`${busyReset ? "animate-pulse" : "group-hover:-translate-y-0.5"} transition-transform`} />
                {busyReset ? "Resetting..." : "Reset Password"}
              </button>

              <div className="text-center text-xs text-slate-400">
                Didn’t get the code? Re-run the previous step or check spam.
              </div>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Remembered your password?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>

      
      <style>
        {`
          @keyframes slow-pan { 0% {transform:translateY(0)} 50% {transform:translateY(-10px)} 100% {transform:translateY(0)} }
          .animate-slow-pan { animation: slow-pan 14s ease-in-out infinite; }
          @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); opacity:.9 } 50% { transform:translate(10px,-10px) scale(1.05); opacity:1 } }
          .animate-orb { animation: orb 12s ease-in-out infinite; }
          .animate-orb-delayed { animation: orb 16s ease-in-out infinite; animation-delay:.8s; }
        `}
      </style>
    </div>
  );
}

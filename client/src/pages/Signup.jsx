

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../utils/api";

const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  
  const [avail, setAvail] = React.useState({ email: null, username: null });
  const [checking, setChecking] = React.useState({ email: false, username: false });

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!EMAIL_REGEX.test(form.email.trim().toLowerCase())) return "Enter a valid email.";
    const uname = form.username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(uname))
      return "Username must be 3–20 chars, lowercase letters, digits and underscores (no leading/trailing underscore).";
    if (!form.password) return "Password is required.";
    if (String(form.password) !== String(form.confirmPassword)) return "Passwords do not match.";
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return toast.error(v);

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };
      const res = await api.post("/auth/signup", payload);
      const msg =
        res?.data?.message ||
        "Signup successful! Please check your email for the verification code.";
      toast.success(msg);

      
      nav("/verify-email", {
        replace: true,
        state: { email: payload.email },
      });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Signup failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const checkEmail = async () => {
    const email = form.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) return;
    setChecking((s) => ({ ...s, email: true }));
    try {
      const res = await api.get("/auth/check-availability", { params: { email } });
      const ok =
        res?.data?.emailAvailable ??
        res?.data?.available ??
        res?.data?.ok ??
        null;
      setAvail((s) => ({ ...s, email: ok }));
    } catch {
      setAvail((s) => ({ ...s, email: null }));
    } finally {
      setChecking((s) => ({ ...s, email: false }));
    }
  };

  const checkUsername = async () => {
    const username = form.username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(username)) return;
    setChecking((s) => ({ ...s, username: true }));
    try {
      const res = await api.get("/auth/check-availability", { params: { username } });
      const ok =
        res?.data?.usernameAvailable ??
        res?.data?.available ??
        res?.data?.ok ??
        null;
      setAvail((s) => ({ ...s, username: ok }));
    } catch {
      setAvail((s) => ({ ...s, username: null }));
    } finally {
      setChecking((s) => ({ ...s, username: false }));
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-stretch">
      
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent),radial-gradient(50%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute inset-0 animate-slow-pan bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl animate-orb" />
        <div className="absolute -bottom-32 -right-20 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl animate-orb-delayed" />
      </div>

      
      <section className="hidden lg:flex relative flex-1 items-center justify-center p-12">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Create your <span className="text-emerald-400">PlanMint</span> account
          </h1>
          <p className="mt-4 text-slate-300/90 leading-relaxed">
            Join a modern, responsive workspace to manage projects and tasks effortlessly.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Optimized for mobile, tablet, and large screens.</span>
          </div>
        </div>
      </section>

      
      <section className="relative flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />
            <div className="px-6 md:px-10 pt-8">
              <Link
                to="/"
                className="block text-center text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100"
              >
                PlanMint
              </Link>
              <p className="mt-3 text-center text-sm text-slate-400">
                Let’s set up your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="px-6 md:px-10 pb-9 pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="col-span-1">
                <label className="block text-sm mb-1 text-slate-300">Full Name</label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaUserCircle size={16} />
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Arbab Arshad"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              
              <div className="col-span-1">
                <label className="block text-sm mb-1 text-slate-300">Email</label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaEnvelope size={16} />
                  </span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    onBlur={checkEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                  />
                  {checking.email ? (
                    <span className="pr-4 text-xs text-slate-400">checking…</span>
                  ) : avail.email === true ? (
                    <span className="pr-4 text-emerald-400" title="Available">
                      <FaCheckCircle />
                    </span>
                  ) : avail.email === false ? (
                    <span className="pr-4 text-rose-400" title="Already taken">
                      <FaTimesCircle />
                    </span>
                  ) : null}
                </div>
              </div>

              
              <div className="col-span-1">
                <label className="block text-sm mb-1 text-slate-300">Username</label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaUser size={16} />
                  </span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    onBlur={checkUsername}
                    placeholder="yourusername"
                    autoComplete="username"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                  />
                  {checking.username ? (
                    <span className="pr-4 text-xs text-slate-400">checking…</span>
                  ) : avail.username === true ? (
                    <span className="pr-4 text-emerald-400" title="Available">
                      <FaCheckCircle />
                    </span>
                  ) : avail.username === false ? (
                    <span className="pr-4 text-rose-400" title="Already taken">
                      <FaTimesCircle />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  3–20 chars, lowercase letters, digits and underscores.
                </p>
              </div>

              
              <div className="col-span-1">
                <label className="block text-sm mb-1 text-slate-300">Password</label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaLock size={16} />
                  </span>
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="pr-4 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              
              <div className="col-span-1">
                <label className="block text-sm mb-1 text-slate-300">Confirm Password</label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaLock size={16} />
                  </span>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
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

              
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                      Sign in
                    </Link>
                  </div>
                  <Link to="/privacy" className="text-slate-400 hover:text-slate-200">
                    Privacy
                  </Link>
                </div>

                
                <button
                  disabled={busy}
                  className="group relative w-full mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <span className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/15 transition-colors" />
                  <FaUserPlus
                    className={`transition-transform ${busy ? "animate-pulse" : "group-hover:-translate-y-0.5"}`}
                  />
                  {busy ? "Creating account..." : "Create Account"}
                </button>

                
                <Link
                  to="/verify-email"
                  className="group relative w-full mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/70 text-sky-300 px-5 py-3.5 font-semibold hover:text-white hover:bg-sky-500/10 transition-all"
                >
                  <span className="absolute inset-0 -z-10 rounded-2xl bg-sky-400/0 group-hover:bg-sky-400/10 transition-colors" />
                  <FaCheckCircle className="transition-transform group-hover:-translate-y-0.5" />
                  Verify your email
                </Link>
              </div>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-slate-400 hover:text-slate-200">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-slate-400 hover:text-slate-200">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      
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

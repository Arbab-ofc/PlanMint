
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // added

export default function Login() {
  
  const { refresh, setUser } = useUser(); 
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from?.pathname || "/dashboard";

  const [form, setForm] = React.useState({ emailOrUsername: "", password: "" });
  const [showPass, setShowPass] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.emailOrUsername || !form.password) {
      toast.error("Please enter email/username and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post("/auth/login", {
        emailOrUsername: form.emailOrUsername,
        password: form.password,
      });
      const msg = res?.data?.message || "Login successful";
      const user = res?.data?.data?.user || res?.data?.user || null;
      if (user) setUser(user);
      toast.success(msg);
      try { await refresh(); } catch {}
      nav(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Invalid credentials. Please try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  
  const prefillEmail = React.useMemo(() => {
    const v = form.emailOrUsername.trim().toLowerCase();
    return EMAIL_REGEX.test(v) ? v : "";
  }, [form.emailOrUsername]);

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
            Welcome to <span className="text-emerald-400">PlanMint</span>
          </h1>
          <p className="mt-4 text-slate-300/90 leading-relaxed">
            Manage projects, tasks, and contacts in one modern workspace. Sign in to access your dashboard and pick up where you left off.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Smooth, responsive, and secure — optimized for mobile, tablet, and desktop.</span>
          </div>
        </div>
      </section>

      
      <section className="relative flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg">
          
          <div className="relative rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
            
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />

            
            <div className="px-6 md:px-8 pt-8">
              <Link
                to="/"
                className="block text-center text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100"
              >
                PlanMint
              </Link>
              <p className="mt-3 text-center text-sm text-slate-400">
                Sign in to continue to your workspace
              </p>
            </div>

            
            <form onSubmit={onSubmit} className="px-6 md:px-8 pb-8 pt-6 space-y-5">
              
              <div>
                <label className="block text-sm mb-1 text-slate-300">
                  Email or Username
                </label>
                <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 transition-all focus-within:border-emerald-500/80 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
                  <span className="pl-4 text-slate-400">
                    <FaUser size={16} />
                  </span>
                  <input
                    name="emailOrUsername"
                    value={form.emailOrUsername}
                    onChange={onChange}
                    autoComplete="username"
                    placeholder="you@example.com / yourusername"
                    className="w-full bg-transparent px-3 py-3.5 outline-none text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              
              <div>
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
                    autoComplete="current-password"
                    placeholder="••••••••"
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

              
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-400">
                  New here?{" "}
                  <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">
                    Create an account
                  </Link>
                </div>
                
                <Link
                  to="/forgot"
                  state={prefillEmail ? { email: prefillEmail } : undefined}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Forgot password?
                </Link>
              </div>

              
              <button
                disabled={busy}
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <span className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/15 transition-colors" />
                <FaSignInAlt
                  className={`transition-transform ${busy ? "animate-pulse" : "group-hover:-translate-y-0.5"}`}
                />
                {busy ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          
          <p className="mt-5 text-center text-xs text-slate-500">
            By continuing, you agree to our{" "}
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

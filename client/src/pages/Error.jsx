

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaArrowLeft, FaRedo, FaBug } from "react-icons/fa";
import { useUser } from "../contexts/AuthContext.jsx";

export default function ErrorPage() {
  const { user } = useUser();
  const isAuthed = !!user;

  const nav = useNavigate();
  const loc = useLocation();

  const qs = React.useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const code =
    loc.state?.code ||
    qs.get("code") ||
    404;

  const title =
    loc.state?.title ||
    (String(code) === "404" ? "Page not found" : "Something went wrong");

  const message =
    loc.state?.message ||
    qs.get("message") ||
    (String(code) === "404"
      ? "We couldn’t find what you’re looking for."
      : "An unexpected error occurred. Please try again.");

  const from = loc.state?.from || qs.get("from") || "/";

  function onBack() {
    
    if (window.history.length > 1) nav(-1);
    else nav("/", { replace: true });
  }

  function onReload() {
    window.location.reload();
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent),radial-gradient(50%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute inset-0 animate-slow-pan bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl animate-orb" />
        <div className="absolute -bottom-32 -right-20 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl animate-orb-delayed" />
      </div>

      
      <div className="relative w-full max-w-2xl">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />

          <div className="p-7 sm:p-9">
            
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-12 w-12 rounded-2xl grid place-items-center bg-red-500/15 border border-red-500/30 text-red-400">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-sm uppercase tracking-wide text-slate-400">PlanMint</div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {title}
                </h1>
                <p className="mt-2 text-slate-300">{message}</p>
                <div className="mt-2 text-slate-500 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <FaBug /> Error code:
                    <span className="font-mono text-slate-200">{String(code)}</span>
                  </span>
                </div>
              </div>
            </div>

            
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isAuthed ? (
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-emerald-600 text-white px-5 py-3 font-semibold shadow-lg shadow-emerald-600/25"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/"
                  className="rounded-2xl bg-emerald-600 text-white px-5 py-3 font-semibold shadow-lg shadow-emerald-600/25"
                >
                  Go Home
                </Link>
              )}

              <button
                onClick={onBack}
                className="rounded-2xl border border-slate-700 text-slate-200 px-5 py-3 font-semibold"
              >
                <span className="inline-flex items-center gap-2">
                  <FaArrowLeft />
                  Back
                </span>
              </button>

              <button
                onClick={onReload}
                className="rounded-2xl border border-slate-700 text-slate-200 px-5 py-3 font-semibold"
              >
                <span className="inline-flex items-center gap-2">
                  <FaRedo />
                  Reload
                </span>
              </button>

              <a
                href={`mailto:hello@example.com?subject=PlanMint%20Error%20${encodeURIComponent(
                  String(code)
                )}&body=${encodeURIComponent(
                  `Hi PlanMint,\n\nI encountered an error.\n\nCode: ${code}\nTitle: ${title}\nMessage: ${message}\nFrom: ${from}\nPath: ${window.location.pathname}\n\n—`
                )}`}
                className="ml-auto rounded-2xl border border-slate-800/60 bg-slate-900/50 px-4 py-3 text-sm text-slate-300"
              >
                Report Issue
              </a>
            </div>

            
            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
              <div className="text-xs text-slate-400">
                If the problem persists, try signing out and back in, or contact support.
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Need help right now?{" "}
          <a href="mailto:hello@example.com" className="text-emerald-400">
            Email support
          </a>
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

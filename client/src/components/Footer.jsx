
import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-0 bg-slate-900 text-slate-300 border-t border-slate-800 overflow-hidden">
      
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0">
        <span className="block h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[shimmer_2.5s_linear_infinite]" />
      </div>

      
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-600/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        <div className="flex items-center justify-center gap-5 mb-3">
          <a
            href="https://github.com/your-username" // TODO: update with your GitHub
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="group inline-flex items-center justify-center p-2 rounded-lg transition-transform duration-200 hover:scale-110"
            title="GitHub"
          >
            <FaGithub className="h-5 w-5 text-slate-300 transition-colors duration-200 group-hover:text-white" />
          </a>

          <a
            href="https://www.linkedin.com/in/your-username" // TODO: update with your LinkedIn
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="group inline-flex items-center justify-center p-2 rounded-lg transition-transform duration-200 hover:scale-110"
            title="LinkedIn"
          >
            <FaLinkedin className="h-5 w-5 text-slate-300 transition-colors duration-200 group-hover:text-sky-400" />
          </a>

          <a
            href="mailto:youremail@example.com" // TODO: update with your email
            aria-label="Email"
            className="group inline-flex items-center justify-center p-2 rounded-lg transition-transform duration-200 hover:scale-110"
            title="Email"
          >
            <FaEnvelope className="h-5 w-5 text-slate-300 transition-colors duration-200 group-hover:text-emerald-400" />
          </a>
        </div>

        
        <p className="text-center text-sm text-slate-400">
          © {year} PlanMint. All rights reserved.
        </p>
        <p className="text-center text-xs text-slate-500 mt-1">
          Designed and Created by <span className="text-slate-200">Arbab Arshad</span>
        </p>
      </div>

      
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}
      </style>
    </footer>
  );
}

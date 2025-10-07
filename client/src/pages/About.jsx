

import React from "react";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaHeart,
  FaUsers,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaQuoteLeft,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaEnvelopeOpenText,
  FaLock,
  FaCogs,
} from "react-icons/fa";
import {
  
  SiVite,
  SiTailwindcss,
  SiReactrouter,
  SiAxios,
  SiExpress,
  SiMongodb,
} from "react-icons/si";

export default function About() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent),radial-gradient(50%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute inset-0 animate-slow-pan bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl animate-orb" />
        <div className="absolute -bottom-32 -right-20 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl animate-orb-delayed" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 sm:pt-32">
        
        <section className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            About <span className="text-emerald-400">PlanMint</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300/90 leading-relaxed">
            A focused project management app crafted with care — to help small teams{" "}
            <span className="text-slate-200">plan, prioritize, and ship</span>.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
            <FaRocket className="text-emerald-400" />
            <span>Built with React + Node + MongoDB • Dark, mobile-first UI</span>
          </div>
        </section>

        
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <Header icon={<FaCheckCircle className="text-emerald-400" />} title="Our Mission" />
            <p className="mt-2 text-slate-300">
              Keep project management <span className="text-slate-100 font-semibold">simple</span> and
              <span className="text-slate-100 font-semibold"> fast</span>. No clutter — just the features
              that move work forward: projects, tasks, deadlines, filters, and clear roles.
            </p>
          </Card>
          <Card>
            <Header icon={<FaBolt className="text-sky-400" />} title="The Story" />
            <p className="mt-2 text-slate-300">
              PlanMint began as a practical tool for small, high-velocity teams. Creator{" "}
              <span className="text-slate-100 font-semibold">Arbab Arshad</span> focused on a crisp
              experience: cookie-based login, email OTP, and a distraction-free workflow.
            </p>
          </Card>
        </section>

        
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Values we work by</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Value icon={<FaHeart />} title="Simplicity" text="Fewer clicks, clearer screens." />
            <Value icon={<FaUsers />} title="Collaboration" text="Roles & members that make sense." />
            <Value icon={<FaShieldAlt />} title="Trust" text="Cookie sessions + OTP verification." />
            <Value icon={<FaRocket />} title="Momentum" text="Ship features that matter first." />
          </div>
        </section>

        
        <section className="mt-14">
          <h2 className="text-2xl font-bold">Tech Stack</h2>
          <p className="mt-2 text-slate-400 text-sm">
            The tools behind PlanMint — styled with a subtle retro vibe.
          </p>

          
          <h3 className="mt-6 text-lg font-semibold text-slate-200">Frontend</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RetroChip icon={<FaReact />} title="React" note="UI library" />
            <RetroChip icon={<SiVite />} title="Vite" note="Build tool" />
            <RetroChip icon={<SiTailwindcss />} title="Tailwind CSS" note="Styling" />
            <RetroChip icon={<SiReactrouter />} title="React Router" note="Routing" />
            <RetroChip icon={<SiAxios />} title="Axios" note="API client" />
          </div>

          
          <h3 className="mt-8 text-lg font-semibold text-slate-200">Backend</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RetroChip icon={<FaNodeJs />} title="Node.js" note="Runtime" />
            <RetroChip icon={<SiExpress />} title="Express" note="HTTP server" />
            <RetroChip icon={<SiMongodb />} title="MongoDB" note="Database" />
            <RetroChip icon={<FaDatabase />} title="Mongoose" note="ODM" />
            <RetroChip icon={<FaEnvelopeOpenText />} title="Nodemailer" note="Emails/OTP" />
            <RetroChip icon={<FaLock />} title="bcrypt" note="Password hashing" />
            <RetroChip icon={<FaCogs />} title="dotenv" note="Config/env" />
          </div>
        </section>

        
        <section className="mt-14">
          <h2 className="text-2xl font-bold">Words from the Creator</h2>
          <div className="mt-6 grid">
            <QuoteCard quote={{ text: "Simplicity scales. The fewer decisions a user makes, the faster they ship." }} />
          </div>
          <div className="mt-6 text-sm text-slate-400">
            — <span className="text-slate-200 font-semibold">Arbab Arshad</span>, Creator of PlanMint
          </div>
        </section>

        
        <section className="mt-14">
          <div className="rounded-3xl border border-emerald-600/30 bg-emerald-600/10 px-6 py-8 sm:px-10 sm:py-10">
            <h3 className="text-2xl font-extrabold">Let’s build better projects.</h3>
            <p className="mt-2 text-slate-300">
              Have feedback or ideas? Reach out or jump in and try PlanMint today.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold shadow-lg shadow-emerald-600/25"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-slate-700 text-slate-200 px-6 py-3 font-semibold"
              >
                Sign In
              </Link>
              <div className="ml-auto flex items-center gap-3 text-slate-300">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/50 px-3 py-2"
                  title="GitHub"
                >
                  <FaGithub />
                  <span className="text-sm">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/50 px-3 py-2"
                  title="LinkedIn"
                >
                  <FaLinkedin />
                  <span className="text-sm">LinkedIn</span>
                </a>
                <a
                  href="mailto:hello@example.com"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/50 px-3 py-2"
                  title="Email"
                >
                  <FaEnvelope />
                  <span className="text-sm">Email</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      
      <style>
        {`
          @keyframes slow-pan { 0% {transform:translateY(0)} 50% {transform:translateY(-10px)} 100% {transform:translateY(0)} }
          .animate-slow-pan { animation: slow-pan 14s ease-in-out infinite; }

          @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); opacity:.9 } 50% { transform:translate(10px,-10px) scale(1.05); opacity:1 } }
          .animate-orb { animation: orb 12s ease-in-out infinite; }
          .animate-orb-delayed { animation: orb 16s ease-in-out infinite; animation-delay:.8s; }

          /* Retro chip look for tech icons */
          .retro-chip {
            position: relative;
            border-radius: 16px;
            background: linear-gradient(180deg, rgba(18,22,28,0.95) 0%, rgba(12,14,18,0.95) 100%);
            border: 2px solid rgba(148,163,184,0.12);
            padding: 14px 14px;
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.03) inset,
              0 10px 24px -10px rgba(0,0,0,0.7),
              0 0 0 3px rgba(0,0,0,0.2);
          }
          .retro-chip:before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 16px;
            background:
              repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.045) 0px,
                rgba(255,255,255,0.045) 1px,
                transparent 2px,
                transparent 4px
              );
            opacity: .35;
            pointer-events: none;
            mix-blend-mode: overlay;
          }
          .retro-ico {
            filter: saturate(1.15) contrast(1.1) drop-shadow(0 2px 0 rgba(0,0,0,0.35));
          }
          .retro-title {
            text-shadow: 0 1px 0 rgba(0,0,0,0.4);
          }
        `}
      </style>
    </div>
  );
}


function Card({ children }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-6 sm:p-8">
      {children}
    </div>
  );
}

function Header({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  );
}

function Value({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
      <div className="text-2xl text-emerald-400">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function RetroChip({ icon, title, note }) {
  return (
    <div className="retro-chip flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-purple-500/10 border border-slate-700/50">
        <span className="text-2xl retro-ico">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="retro-title font-semibold">{title}</div>
        <div className="text-xs text-slate-400">{note}</div>
      </div>
    </div>
  );
}

function QuoteCard({ quote }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      <FaQuoteLeft className="text-slate-500 text-xl" />
      <p className="mt-3 text-slate-200 leading-relaxed">“{quote.text}”</p>
      <div className="mt-4 text-sm text-slate-400">— Arbab Arshad</div>
    </div>
  );
}

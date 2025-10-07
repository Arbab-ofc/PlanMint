

import React from "react";
import { Link } from "react-router-dom";
import {
  FaProjectDiagram,
  FaTasks,
  FaBell,
  FaSearch,
  FaUserFriends,
  FaShieldAlt,
  FaMobileAlt,
  FaUserPlus,
  FaChartLine,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

function Stars({ rating = 5 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f-${i}`} />
      ))}
      {half ? <FaStarHalfAlt /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e-${i}`} />
      ))}
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Aarav Mehta", role: "Product Lead @ Nova", rating: 4.5, text: "Simple, fast, and focused. Our sprints are finally predictable.", avatar: "https://i.pravatar.cc/100?img=1" },
  { name: "Zara Khan", role: "PM @ BlueYard", rating: 5, text: "The search & filters are 🔥 — I find anything in seconds.", avatar: "https://i.pravatar.cc/100?img=2" },
  { name: "Kabir Singh", role: "Founder @ Craftly", rating: 4, text: "Lightweight project setup. Members via username is a win.", avatar: "https://i.pravatar.cc/100?img=3" },
  { name: "Aisha Verma", role: "Lead Designer", rating: 5, text: "Dark UI, clean cards, everything feels professional.", avatar: "https://i.pravatar.cc/100?img=4" },
  { name: "Ravi Patel", role: "Engineering Manager", rating: 4.5, text: "Cookie-based login + OTP kept the auth simple and secure.", avatar: "https://i.pravatar.cc/100?img=5" },
  { name: "Meera Nair", role: "Freelance PM", rating: 5, text: "Perfect for small teams. Straight to the point.", avatar: "https://i.pravatar.cc/100?img=6" },
  { name: "Arjun Das", role: "CTO @ Rivulet", rating: 4.5, text: "Task labels + priorities helped us reduce context-switching.", avatar: "https://i.pravatar.cc/100?img=7" },
  { name: "Simran Kaur", role: "Ops @ QuickShip", rating: 4, text: "Notifications are just right — not noisy, not silent.", avatar: "https://i.pravatar.cc/100?img=8" },
  { name: "Vikram Rao", role: "Scrum Master", rating: 4.5, text: "Progress tracking gives a clean snapshot for standups.", avatar: "https://i.pravatar.cc/100?img=9" },
  { name: "Nina Kapoor", role: "Founder @ StudioNK", rating: 5, text: "Mobile-first UI saved me during travel.", avatar: "https://i.pravatar.cc/100?img=10" },
  { name: "Rahul Gupta", role: "Analyst", rating: 4, text: "Contacts model is underrated — stakeholders finally organized.", avatar: "https://i.pravatar.cc/100?img=11" },
  { name: "Ishita Roy", role: "Program Manager", rating: 4.5, text: "Roles (Owner/Admin/Member) nail the permission basics.", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Dev Mishra", role: "Lead Dev", rating: 5, text: "No fluff. Ships fast.", avatar: "https://i.pravatar.cc/100?img=13" },
  { name: "Anaya Joshi", role: "QA @ SoftLoop", rating: 4.5, text: "Due dates + filters = zero surprises on release day.", avatar: "https://i.pravatar.cc/100?img=14" },
  { name: "Harsh Vardhan", role: "Consultant", rating: 5, text: "Exactly what I wanted — clear, modern, minimal.", avatar: "https://i.pravatar.cc/100?img=15" },
];

function TestimonialCarousel() {
  const [index, setIndex] = React.useState(0);
  const [prevIndex, setPrevIndex] = React.useState(0);
  const [showPrev, setShowPrev] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      setPrevIndex((p) => {
        const next = (index + 1) % TESTIMONIALS.length; 
        return index;
      });
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
      setShowPrev(true);
      const t = setTimeout(() => setShowPrev(false), 600); 
      return () => clearTimeout(t);
    }, 2000);
    return () => clearInterval(id);
  }, [index]);

  const current = TESTIMONIALS[index];
  const prev = TESTIMONIALS[prevIndex];

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative h-[260px] sm:h-[240px]">
        
        {showPrev && (
          <div className="absolute inset-0 animate-fade-out">
            <TestimonialCard item={prev} />
          </div>
        )}
        
        <div className="absolute inset-0 animate-fade-in">
          <TestimonialCard item={current} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-emerald-400" : "w-2 bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <div className="h-full w-full rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-6 sm:p-7 flex items-center">
      <div className="flex items-center gap-5">
        <img
          src={item.avatar}
          alt={`${item.name} avatar`}
          className="h-16 w-16 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-slate-700/60"
          draggable="false"
        />
        <div className="space-y-1">
          <div className="text-lg font-semibold text-slate-100">{item.name}</div>
          <div className="text-sm text-slate-400">{item.role}</div>
          <Stars rating={item.rating} />
        </div>
      </div>
      <div className="ml-6 sm:ml-7 pr-2 text-slate-200/95 leading-relaxed line-clamp-3">
        “{item.text}”
      </div>
    </div>
  );
}

export default function Home() {
  const [faqOpen, setFaqOpen] = React.useState(null);
  const toggleFaq = (i) => setFaqOpen((o) => (o === i ? null : i));

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

      
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Plan projects that <span className="text-emerald-400">actually ship</span>.
          </h1>
          <p className="mt-4 text-lg text-slate-300/90 leading-relaxed">
            Create projects, assign tasks, set deadlines, and track progress — fast.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
          </div>
          <div className="mt-6 text-sm text-slate-400">
            Cookie-based login • Email OTP • Mobile friendly
          </div>
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 pb-10">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md px-5 py-4 text-center text-slate-400 text-sm">
          Trusted by project teams & freelancers.
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold">Core Features</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<FaProjectDiagram />}
            title="Projects & Roles"
            text="Owner/Admin/Member roles. Add members via username."
          />
          <FeatureCard
            icon={<FaTasks />}
            title="Tasks"
            text="Assign tasks, due dates, status & priority tags."
          />
          <FeatureCard
            icon={<FaSearch />}
            title="Search & Filters"
            text="Find projects and tasks instantly with filters."
          />
          <FeatureCard
            icon={<FaBell />}
            title="Notifications"
            text="Mentions, assignments, and due reminders."
          />
          <FeatureCard
            icon={<FaUserFriends />}
            title="Contacts"
            text="Store stakeholders and relate them to work."
          />
          <FeatureCard
            icon={<FaShieldAlt />}
            title="Secure & Mobile"
            text="Cookie sessions, email OTP, mobile-first UI."
          />
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <HowCard icon={<FaProjectDiagram />} label="Create a project" text="Set roles and labels." />
          <HowCard icon={<FaUserPlus />} label="Invite members" text="Add by username, assign tasks." />
          <HowCard icon={<FaChartLine />} label="Track progress" text="Filters & notifications keep you on track." />
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold">Why PlanMint?</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">Less juggling — everything in one place</li>
          <li className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">Fast search & precise filters</li>
          <li className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">Clean, dark UI — mobile-first</li>
          <li className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">Email OTP, cookie session, secure defaults</li>
        </ul>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">What users say</h2>
        
        <div className="mt-6">
          <TestimonialCarousel />
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-3">
          {[
            { q: "Is my data secure?", a: "Yes. Cookie-based sessions and email OTP verification by default." },
            { q: "Can I reset my password?", a: "Yes. Use the Forgot Password flow to get an OTP and reset securely." },
            { q: "How do roles work?", a: "Each project has Owner, Admin, and Member. Owners control everything; Admins manage; Members collaborate." },
            { q: "How do I invite members?", a: "By username — quick and consistent across the app." },
            { q: "Is there a mobile app?", a: "The web app is mobile-first and works great on phones and tablets." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/50">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full text-left px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{f.q}</span>
                  <span className="text-slate-400">{faqOpen === i ? "–" : "+"}</span>
                </div>
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-5 text-slate-300">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      
      <section className="relative max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl border border-emerald-600/30 bg-emerald-600/10 px-6 py-8 sm:px-10 sm:py-10">
          <h3 className="text-2xl font-extrabold">
            Start planning in minutes.
          </h3>
          <p className="mt-2 text-slate-300">
            Create a free account and set up your first project today.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold shadow-lg shadow-emerald-600/25"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-slate-700 text-slate-200 px-6 py-3 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      
      <style>
        {`
          @keyframes slow-pan { 0% {transform:translateY(0)} 50% {transform:translateY(-10px)} 100% {transform:translateY(0)} }
          .animate-slow-pan { animation: slow-pan 14s ease-in-out infinite; }

          @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); opacity:.9 } 50% { transform:translate(10px,-10px) scale(1.05); opacity:1 } }
          .animate-orb { animation: orb 12s ease-in-out infinite; }
          .animate-orb-delayed { animation: orb 16s ease-in-out infinite; animation-delay:.8s; }

          @keyframes fadeUpIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
          .animate-fade-in { animation: fadeUpIn .6s ease both; }
          .animate-fade-out { animation: fadeOut .6s ease both; }
        `}
      </style>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md p-5">
      <div className="text-emerald-400 text-2xl">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-slate-400 text-sm">{text}</p>
    </div>
  );
}

function HowCard({ icon, label, text }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
      <div className="text-sky-400 text-2xl">{icon}</div>
      <div className="mt-3 font-semibold">{label}</div>
      <p className="mt-1 text-slate-400 text-sm">{text}</p>
    </div>
  );
}

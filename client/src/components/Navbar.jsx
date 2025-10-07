import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaTachometerAlt,
} from "react-icons/fa";

import { useUser } from "../contexts/AuthContext.jsx";
import api from "../utils/api";

export default function Header() {
  const { isAuthenticated, user, loading, refresh, setUser } = useUser();
  const [open, setOpen] = React.useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = React.useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    } finally {
      setUser(null);
      try {
        await refresh();
      } catch {}
    }
  }, [refresh, setUser]);

  const base =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/60";
  const link =
    "text-slate-200 hover:text-white hover:bg-slate-800/60 aria-[current=page]:bg-slate-800/60";
  const brand = "text-2xl font-extrabold text-slate-100 select-none";

  
  const letter = (user?.data?.user?.name?.[0] || user?.username?.[0] || "?").toUpperCase();
  const role = (user?.role || user?.data?.user?.role || "").toLowerCase();
  const borderClass = role === "admin" ? "border-amber-400" : "border-emerald-500";
  const hasAvatar = Boolean(user?.avatarUrl);
  const isAdmin = role === "admin";

  return (
    <header className="relative top-0 inset-x-0 z-50 bg-slate-900 text-slate-100 border-b border-slate-800">
      <nav className="max-w-7xl mx-auto h-14 flex items-center justify-between px-4 md:px-6">
        <Link to="/" className={brand} onClick={closeMenu}>
          PlanMint
        </Link>

        
        <div className="hidden lg:flex items-center gap-2">
          <NavLink
            to="/about"
            className={({ isActive }) => `${base} ${link}`}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            <span className="inline-flex items-center gap-2">
              <FaInfoCircle size={14} />
              About Us
            </span>
          </NavLink>

          {!loading && !isAuthenticated && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `${base} ${link}`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="inline-flex items-center gap-2">
                  <FaSignInAlt size={14} />
                  Login
                </span>
              </NavLink>
              <NavLink
                to="/signup"
                className={`${base} bg-emerald-600/90 hover:bg-emerald-600 text-white`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaUserPlus size={14} />
                  Register
                </span>
              </NavLink>
            </>
          )}

          {!loading && isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `${base} ${link}`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="inline-flex items-center gap-2">
                  <FaTachometerAlt size={14} />
                  Dashboard
                </span>
              </NavLink>

              
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `${base} ${link}`}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  <span className="inline-flex items-center gap-2">
                    <FaTachometerAlt size={14} />
                    Admin Portal
                  </span>
                </NavLink>
              )}

              
              <Link to="/profile" className="ml-1" title="My Profile">
                {hasAvatar ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className={`h-8 w-8 rounded-full object-cover border ${borderClass}`}
                  />
                ) : (
                  <span
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-full border ${borderClass} bg-slate-800 text-slate-200 font-bold`}
                  >
                    {letter}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-2 rounded-md text-sm font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-100 inline-flex items-center gap-2"
              >
                <FaSignOutAlt size={14} />
                Logout
              </button>
            </>
          )}
        </div>

        
        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span
            className={`transition-transform duration-300 ease-out ${
              open ? "rotate-90 scale-90 opacity-0" : "rotate-0 scale-100 opacity-100"
            } absolute`}
          >
            <FaBars size={18} />
          </span>
          <span
            className={`transition-transform duration-300 ease-out ${
              open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-90 opacity-0"
            }`}
          >
            <FaTimes size={18} />
          </span>
        </button>
      </nav>

      
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-slate-900/50 transition-opacity duration-300 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      
      <div
        className={`
          lg:hidden fixed top-14 inset-x-0 z-50 origin-top
          transform transition-[transform,opacity] duration-400
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? "opacity-100 translate-y-0 scale-y-100" : "opacity-0 -translate-y-2 scale-y-95 pointer-events-none"}
        `}
      >
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2 shadow-xl">
          <NavLink
            to="/about"
            onClick={closeMenu}
            className={({ isActive }) => `block ${base} ${link} w-full text-left`}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            <span className="inline-flex items-center gap-2">
              <FaInfoCircle size={14} />
              About Us
            </span>
          </NavLink>

          {!loading && !isAuthenticated && (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) => `block ${base} ${link} w-full text-left`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="inline-flex items-center gap-2">
                  <FaSignInAlt size={14} />
                  Login
                </span>
              </NavLink>

              <NavLink
                to="/signup"
                onClick={closeMenu}
                className={`block ${base} w-full text-left bg-emerald-600/90 hover:bg-emerald-600 text-white`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaUserPlus size={14} />
                  Register
                </span>
              </NavLink>
            </>
          )}

          {!loading && isAuthenticated && (
            <>
              
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) => `block ${base} ${link} w-full text-left`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="inline-flex items-center gap-2">
                  {hasAvatar ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className={`h-4 w-4 rounded-full object-cover border ${borderClass}`}
                    />
                  ) : (
                    <span
                      className={`h-4 w-4 inline-flex items-center justify-center rounded-full border ${borderClass} bg-slate-800 text-[10px] font-bold`}
                    >
                      {letter}
                    </span>
                  )}
                  My Profile
                </span>
              </NavLink>

              <NavLink
                to="/dashboard"
                onClick={closeMenu}
                className={({ isActive }) => `block ${base} ${link} w-full text-left`}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="inline-flex items-center gap-2">
                  <FaTachometerAlt size={14} />
                  Dashboard
                </span>
              </NavLink>

              
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={closeMenu}
                  className={({ isActive }) => `block ${base} ${link} w-full text-left`}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  <span className="inline-flex items-center gap-2">
                    <FaTachometerAlt size={14} />
                    Admin Portal
                  </span>
                </NavLink>
              )}

              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-100 inline-flex items-center gap-2"
              >
                <FaSignOutAlt size={14} />
                Logout
              </button>

              <div className="px-1 text-xs text-slate-400">
                {user?.username ? `Signed in as ${user.username}` : ""}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

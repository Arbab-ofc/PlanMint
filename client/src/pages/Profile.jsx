import React from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";

export default function Profile() {
  const { user, refresh, setUser } = useUser();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pwdBusy, setPwdBusy] = React.useState(false);
  const [avatarBusy, setAvatarBusy] = React.useState(false);

  const [profile, setProfile] = React.useState(null);

  const [name, setName] = React.useState("");
  const [timezone, setTimezone] = React.useState("");
  const [locale, setLocale] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      const u = res?.data?.data?.user;
      setProfile(u || null);
      setName(u?.name || "");
      setTimezone(u?.timezone || "");
      setLocale(u?.locale || "");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/profile", {
        name: name.trim(),
        timezone: (timezone || "").trim(),
        locale: (locale || "").trim(),
      });
      toast.success("Profile updated");
      await Promise.all([loadProfile(), refresh().catch(() => {})]);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file); 
      const res = await api.post("/users/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUser = res?.data?.data?.user;
      toast.success("Avatar uploaded");
     
      if (newUser) setUser((prev) => ({ ...(prev || {}), ...newUser }));
      await Promise.all([loadProfile(), refresh().catch(() => {})]);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Upload failed");
    } finally {
      setAvatarBusy(false);
      
      e.target.value = "";
    }
  }

  async function removeAvatar() {
    if (!window.confirm("Remove your avatar?")) return;
    setAvatarBusy(true);
    try {
      const res = await api.delete("/users/avatar");
      const newUser = res?.data?.data?.user;
      toast.success("Avatar removed");
      if (newUser) setUser((prev) => ({ ...(prev || {}), ...newUser }));
      await Promise.all([loadProfile(), refresh().catch(() => {})]);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Remove failed");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return toast.error("Enter password and confirm password");
    }
    setPwdBusy(true);
    try {
      await api.patch("/users/password", { password, confirmPassword });
      toast.success("Password changed");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Change password failed");
    } finally {
      setPwdBusy(false);
    }
  }

  const hasAvatar = Boolean(profile?.avatarUrl);
  const letter = (profile?.name?.[0] || profile?.username?.[0] || "?").toUpperCase();
  const role = (profile?.role || "").toLowerCase();
  const borderClass = role === "admin" ? "border-amber-400" : "border-emerald-500";

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-extrabold">My Profile</h1>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
            Loading…
          </div>
        ) : !profile ? (
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
            Profile not found
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
            
            <section className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6">
              <div className="flex flex-col items-center gap-4">
                {hasAvatar ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className={`h-28 w-28 rounded-full object-cover border ${borderClass}`}
                  />
                ) : (
                  <span
                    className={`h-28 w-28 inline-flex items-center justify-center rounded-full border ${borderClass} bg-slate-800 text-3xl font-extrabold`}
                  >
                    {letter}
                  </span>
                )}

                <div className="text-center">
                  <div className="text-xl font-bold">{profile.name}</div>
                  <div className="text-slate-400">@{profile.username}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Role: <span className="font-semibold text-slate-200">{profile.role}</span>
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-sm mb-1 text-slate-300">Change avatar</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={avatarBusy}
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-slate-700 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200"
                    />
                    {hasAvatar && (
                      <button
                        onClick={removeAvatar}
                        disabled={avatarBusy}
                        className="rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            
            <section className="grid gap-6">
              {/* Profile details */}
              <form
                onSubmit={saveProfile}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6"
              >
                <h2 className="text-xl font-bold">Profile details</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Email</label>
                    <input
                      value={profile.email || ""}
                      disabled
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Username</label>
                    <input
                      value={profile.username || ""}
                      disabled
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Timezone</label>
                    <input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="Asia/Kolkata"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1 text-slate-300">Locale</label>
                    <input
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      placeholder="en-IN"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>

              
              <form
                onSubmit={changePassword}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6"
              >
                <h2 className="text-xl font-bold">Change password</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">New password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    disabled={pwdBusy}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
                  >
                    {pwdBusy ? "Changing…" : "Change password"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Password must be 8–128 characters and include at least one letter and one number.
                </p>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

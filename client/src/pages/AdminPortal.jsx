import React from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";

function Chip({ ok, children }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-lg border text-xs ${
        ok ? "border-emerald-600/40 text-emerald-300" : "border-slate-700 text-slate-300"
      }`}
    >
      {children}
    </span>
  );
}

function UserCard({ u, onChanged }) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [roleBusy, setRoleBusy] = React.useState(false);
  const [verifyBusy, setVerifyBusy] = React.useState(false);

  const [name, setName] = React.useState(u.name || "");
  const [timezone, setTimezone] = React.useState(u.timezone || "");
  const [locale, setLocale] = React.useState(u.locale || "");
  const [avatarUrl, setAvatarUrl] = React.useState(u.avatarUrl || "");
  const [emailVerified, setEmailVerified] = React.useState(Boolean(u.emailVerified));

  const letter = (u?.name?.[0] || u?.username?.[0] || "?").toUpperCase();
  const role = (u?.role || "").toLowerCase();
  const borderClass = role === "admin" ? "border-amber-400" : "border-emerald-500";
  const hasAvatar = Boolean(u?.avatarUrl);

  const changeRole = async (newRole) => {
    if (!newRole || newRole === u.role) return;
    setRoleBusy(true);
    try {
      const res = await api.patch(`/admin/users/${u._id}/role`, { role: newRole });
      toast.success(res?.data?.message || "Role updated");
      await onChanged?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Role update failed");
    } finally {
      setRoleBusy(false);
    }
  };

  const verifyEmail = async () => {
    if (u.emailVerified) return;
    setVerifyBusy(true);
    try {
      const res = await api.patch(`/admin/users/${u._id}/verify-email`);
      toast.success(res?.data?.message || "Email verified");
      await onChanged?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Verify failed");
    } finally {
      setVerifyBusy(false);
    }
  };

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        timezone: (timezone || "").trim(),
        locale: (locale || "").trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
        emailVerified: Boolean(emailVerified),
      };
      const res = await api.put(`/admin/users/${u._id}`, payload);
      toast.success(res?.data?.message || "User updated");
      setEditing(false);
      await onChanged?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
      <div className="flex items-start gap-3">
        {hasAvatar ? (
          <img
            src={u.avatarUrl}
            alt="avatar"
            className={`h-12 w-12 rounded-full object-cover border ${borderClass}`}
          />
        ) : (
          <span
            className={`h-12 w-12 inline-flex items-center justify-center rounded-full border ${borderClass} bg-slate-800 text-lg font-extrabold`}
          >
            {letter}
          </span>
        )}

        <div className="min-w-0">
          <div className="font-bold text-lg leading-tight">{u.name}</div>
          <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Chip ok={u.role === "admin"}>Role: <b>{u.role}</b></Chip>
            <Chip ok={u.emailVerified}>Email: <b>{u.emailVerified ? "Verified" : "Unverified"}</b></Chip>
            <span className="text-slate-500 text-xs">TZ: {u.timezone || "—"} • Locale: {u.locale || "—"}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!u.emailVerified && (
            <button
              onClick={verifyEmail}
              disabled={verifyBusy}
              className="rounded-xl border border-emerald-600/40 px-3 py-1.5 text-sm"
            >
              {verifyBusy ? "Verifying…" : "Verify Email"}
            </button>
          )}
          <button
            onClick={() => setEditing((s) => !s)}
            className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm"
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-slate-400">Change Role:</label>
        <select
          defaultValue={u.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={roleBusy}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </div>

      {editing && (
        <form onSubmit={save} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1 text-slate-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-300">Avatar URL</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
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
            <div>
              <label className="block text-sm mb-1 text-slate-300">Locale</label>
              <input
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="en-IN"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={emailVerified}
                  onChange={(e) => setEmailVerified(e.target.checked)}
                />
                Email Verified
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-slate-800 px-4 py-2"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminPortal() {
  const { user } = useUser();
  const isAdmin = ((user?.role || user?.data?.user?.role || "") + "").toLowerCase() === "admin";

  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [fRole, setFRole] = React.useState(""); 
  const [fVerified, setFVerified] = React.useState(""); 
  const limit = 10;

  React.useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadUsers({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadUsers({ page: pg = page } = {}) {
    setLoading(true);
    try {
      const params = {
        page: pg,
        limit,
        search: search || undefined,
        role: fRole || undefined,
        emailVerified: fVerified !== "" ? fVerified : undefined,
      };
      const res = await api.get("/admin/users", { params });
      const list = res?.data?.data?.users || [];
      const pgInfo = res?.data?.data?.pagination || {};
      setUsers(list);
      setPage(pgInfo.currentPage || 1);
      setPages(pgInfo.totalPages || 1);
      setTotal(pgInfo.totalUsers || list.length);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="relative w-full min-h-screen bg-slate-950 text-slate-100">
        <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <h1 className="text-3xl font-extrabold">Admin Portal</h1>
          <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
            Access denied. Admins only.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-extrabold">Admin Portal</h1>

        
        <section className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email/username"
              className="flex-1 min-w-[200px] rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
            />
            <select
              value={fRole}
              onChange={(e) => setFRole(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <select
              value={fVerified}
              onChange={(e) => setFVerified(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
            >
              <option value="">Any Email Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <button
              onClick={() => loadUsers({ page: 1 })}
              className="ml-auto rounded-xl border border-slate-800 px-3 py-2"
            >
              Apply
            </button>
          </div>
        </section>

        
        <section className="mt-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
              Loading…
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
              No users found
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {users.map((u) => (
                <UserCard key={u._id} u={u} onChanged={() => loadUsers({ page })} />
              ))}
            </div>
          )}
        </section>

        
        <section className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Page {page} of {pages} • Total {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => loadUsers({ page: page - 1 })}
              className="rounded-xl border border-slate-800/60 px-3 py-2 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= pages}
              onClick={() => loadUsers({ page: page + 1 })}
              className="rounded-xl border border-slate-800/60 px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

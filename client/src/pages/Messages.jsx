
import React from "react";
import { toast } from "react-toastify";
import {
  FaBell, FaSearch, FaCheckCircle, FaTrash, FaSync, FaFilter, FaInbox
} from "react-icons/fa";
import api from "../utils/api";

const TYPE_LABEL = {
  task_assigned: "Task assigned",
  task_status_changed: "Task status changed",
  task_due_soon: "Task due soon",
  task_overdue: "Task overdue",
  comment_added: "New comment",
  project_member_added: "Member added",
  project_role_changed: "Role changed",
};
const TYPE_OPTIONS = [
  "", "task_assigned", "task_status_changed", "task_due_soon", "task_overdue",
  "comment_added", "project_member_added", "project_role_changed"
];

export default function Messages() {
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [error, setError] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [pages, setPages] = React.useState(1);

  const [unreadCount, setUnreadCount] = React.useState(0);


  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [type, setType] = React.useState("");
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => {
      load();
      fetchUnread();
    }, 150);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, unreadOnly, type]);

  async function fetchUnread() {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res?.data?.data?.unreadCount ?? 0);
    } catch (err) {
      // not fatal
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/notifications", {
        params: {
          page,
          limit,
          unreadOnly: unreadOnly ? "true" : undefined,
          type: type || undefined,
        },
      });
      const arr = res?.data?.data?.notifications || [];
      const pg = res?.data?.data?.pagination || {};
      setList(arr);
      setPages(pg?.pages || pg?.totalPages || 1);
    } catch (err) {
      setError(err);
      toast.error(err?.data?.message || err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      toast.success("Marked as read");
      await load();
      await fetchUnread();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to mark read");
    }
  }

  async function deleteOne(id) {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Notification deleted");
      await load();
      await fetchUnread();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  }

  async function markAllRead() {
    if (!window.confirm("Mark ALL unread notifications as read?")) return;
    try {
      await api.patch("/notifications/mark-all-read");
      toast.success("All marked as read");
      await load();
      await fetchUnread();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to mark all");
    }
  }

  async function deleteAllRead() {
    if (!window.confirm("Delete ALL read notifications?")) return;
    try {
      await api.delete("/notifications/delete-all-read");
      toast.success("All read notifications deleted");
      await load();
      await fetchUnread();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete read");
    }
  }

  const filtered = React.useMemo(() => {
    const qn = q.trim().toLowerCase();
    if (!qn) return list;
    return list.filter((n) => {
      const hay = [
        n?.message || "",
        TYPE_LABEL[n?.type] || n?.type || "",
        (n?.ref?.projectId?.name || ""),
      ].join(" • ").toLowerCase();
      return hay.includes(qn);
    });
  }, [list, q]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <BgAnim />

      <main className="relative max-w-6xl mx-auto px-6 pt-28 sm:pt-32 pb-16">
        <section className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <FaBell /> All Notifications
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Unread: <span className="text-slate-200 font-semibold">{unreadCount}</span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <FaSearch className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search message, project, type…"
                className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-64 sm:w-80"
              />
            </div>
            <button
              onClick={() => load()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2"
              title="Refresh"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </section>

        
        <section className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={unreadOnly}
                onChange={(e) => { setPage(1); setUnreadOnly(e.target.checked); }}
              />
              Unread only
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm"><FaFilter /></span>
              <select
                value={type}
                onChange={(e) => { setPage(1); setType(e.target.value); }}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none text-sm"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t || "all"} value={t}>
                    {t ? TYPE_LABEL[t] || t : "All types"}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 px-3 py-2 text-sm font-semibold shadow-md"
              >
                <FaCheckCircle /> Mark all read
              </button>
              <button
                onClick={deleteAllRead}
                className="inline-flex items-center gap-2 rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300"
              >
                <FaTrash /> Delete all read
              </button>
            </div>
          </div>
        </section>

        
        <section className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
              Loading…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
              Failed to load notifications.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-10 text-center">
              <div className="text-5xl mb-3 text-slate-500"><FaInbox /></div>
              <div className="text-lg font-semibold">No notifications</div>
              <p className="text-slate-400 mt-1">Try changing filters or refresh.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((n) => {
                const label = TYPE_LABEL[n?.type] || n?.type || "Notification";
                const when = n?.createdAt ? new Date(n.createdAt).toLocaleString() : "";
                const projectName = n?.ref?.projectId?.name
                  ? n.ref.projectId.name
                  : (typeof n?.ref?.projectId === "string" ? n.ref.projectId : null);
                const msg = n?.message || "";

                return (
                  <li key={n._id} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-100">
                          {label}
                          <span className="text-xs text-slate-400 ml-2">{when}</span>
                          {!n.readAt && (
                            <span className="ml-2 text-xs text-rose-300">• Unread</span>
                          )}
                        </div>
                        {projectName ? (
                          <div className="mt-1 text-xs text-slate-400">Project: <span className="text-slate-200">{projectName}</span></div>
                        ) : null}
                        {msg ? (
                          <div className="mt-2 text-slate-300 whitespace-pre-wrap">{msg}</div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        {!n.readAt && (
                          <button
                            onClick={() => markRead(n._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 px-3 py-2 text-sm"
                          >
                            <FaCheckCircle /> Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteOne(n._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        
        <section className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Page {page} of {pages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-800/60 px-3 py-2 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
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

function BgAnim() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent),radial-gradient(50%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent)]" />
      <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        <div className="absolute inset-0 animate-slow-pan bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl animate-orb" />
      <div className="absolute -bottom-32 -right-20 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl animate-orb-delayed" />
    </div>
  );
}

import React from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaTasks, FaPlus, FaSearch, FaFilter, FaUserTag, FaCalendarAlt, FaTag, FaFlag, FaUser, FaTrash,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaEye
} from "react-icons/fa";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";


const STATUSES = ["Todo", "In-Progress", "Done"];
const PRIORITIES = ["low", "medium", "high"];

function idStr(x) {
  if (!x) return null;
  if (typeof x === "string") return x;
  if (typeof x === "object" && x._id) return String(x._id);
  try { return String(x); } catch { return null; }
}
function unameStr(x) {
  return (x || "").toLowerCase();
}
function memberMatches(m, myId, myUsername) {
  const mUserId = idStr(m?.user);
  const mUsername = unameStr(m?.username);
  if (mUserId && myId && String(mUserId) === String(myId)) return true;
  if (mUsername && myUsername && mUsername === unameStr(myUsername)) return true;
  return false;
}
function resolveMyRole(project, me) {
  if (!project || !me) return null;
  const myId = idStr(me?.data?.user?._id || me?.data?.user?.id || me?._id || me?.id);
  const myUsername = unameStr(me?.data?.user?.username || me?.username);

  const cb = project?.createdBy;
  const cbId = idStr(typeof cb === "object" ? cb?._id : cb);
  const cbU = unameStr(typeof cb === "object" ? cb?.username : project?.createdByUsername);
  if ((myId && cbId && String(myId) === String(cbId)) || (myUsername && cbU && myUsername === cbU)) {
    return "owner";
  }

  const hit = (project?.members || []).find((m) => memberMatches(m, myId, myUsername));
  return hit?.role || null;
}
function myUsername(user) {
  return user?.data?.user?.username || user?.username || "";
}
function ymd(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toISOString().slice(0,10);
}


export default function ProjectTasks() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const { user } = useUser();
  const [sp] = useSearchParams();
  const presetAssignee = (sp.get("assignee") || "").toLowerCase();

  const [project, setProject] = React.useState(null);
  const [role, setRole] = React.useState(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [limit] = React.useState(20);

  const [status, setStatus] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [onlyMine, setOnlyMine] = React.useState(false);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [busyCreate, setBusyCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    assigneeUsername: "",
    status: "Todo",
    priority: "medium",
    dueDate: "",
    labelsInput: "",
  });

  const [busyInline, setBusyInline] = React.useState(null);
  const meU = myUsername(user).toLowerCase();

  React.useEffect(() => { loadProject(); /* eslint-disable-next-line */ }, [projectId]);

  React.useEffect(() => {
    const id = setTimeout(() => { loadTasks(); }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, page, status, priority, onlyMine]);

  React.useEffect(() => {
    if (project?.members && presetAssignee) {
      const isMember = project.members.some(m => m.username?.toLowerCase() === presetAssignee);
      if (isMember) {
        setForm((s) => ({ ...s, assigneeUsername: presetAssignee }));
      }
    }
  }, [project, presetAssignee]);

  async function loadProject() {
    try {
      const res = await api.get(`/projects/${projectId}`);
      const p = res?.data?.data?.project;
      setProject(p || null);
      const r = resolveMyRole(p, user);
      setRole(r);
      if (r === "member") setOnlyMine(true);
    } catch (err) {
      setProject(null);
      toast.error(err?.data?.message || err?.message || "Failed to load project");
    }
  }

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (priority) params.priority = priority;

      
      if (role === "owner" || role === "admin") {
        if (onlyMine && meU) params.assigneeUsername = meU;
        if (search?.trim()) params.search = search.trim();
      } else {
        params.assigneeUsername = meU || undefined;
        if (search?.trim()) params.search = search.trim();
      }

      const res = await api.get(`/projects/${projectId}/tasks`, { params });
      const arr = res?.data?.data?.tasks || [];
      const pg = res?.data?.data?.pagination || {};
      setTasks(arr);
      setPages(pg.totalPages || pg.pages || 1);
    } catch (err) {
      setError(err);
      toast.error(err?.data?.message || err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  const canManage = role === "owner" || role === "admin";

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  function resetCreate() {
    setForm({
      title: "",
      description: "",
      assigneeUsername: presetAssignee || "",
      status: "Todo",
      priority: "medium",
      dueDate: "",
      labelsInput: "",
    });
  }
  function quickAssign(username) {
    if (!canManage) return;
    setOpenCreate(true);
    setForm((s) => ({ ...s, assigneeUsername: username.toLowerCase() }));
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!canManage) {
      toast.info("Only owner/admin can create tasks");
      return;
    }
    const title = (form.title || "").trim();
    if (!title) return toast.error("Title is required");
    if (title.length > 200) return toast.error("Title must be ≤ 200 chars");

    const labels = (form.labelsInput || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      projectId,
      title,
      description: (form.description || "").trim(),
      assigneeUsername: form.assigneeUsername ? form.assigneeUsername.trim().toLowerCase() : undefined,
      status: STATUSES.includes(form.status) ? form.status : undefined,
      priority: PRIORITIES.includes(form.priority) ? form.priority : undefined,
      dueDate: form.dueDate || undefined,
      labels: labels.length ? labels : undefined,
    };

    setBusyCreate(true);
    try {
      await api.post("/tasks", payload);
      toast.success("Task created");
      setOpenCreate(false);
      resetCreate();
      setPage(1);
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Create task failed");
    } finally {
      setBusyCreate(false);
    }
  }

  async function inlineStatus(taskId, next) {
    if (!canManage) return toast.info("Only owner/admin can change status");
    setBusyInline(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: next });
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to change status");
    } finally {
      setBusyInline(null);
    }
  }
  async function inlinePriority(taskId, p) {
    if (!canManage) return toast.info("Only owner/admin can change priority");
    setBusyInline(taskId);
    try {
      await api.patch(`/tasks/${taskId}/priority`, { priority: p });
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to change priority");
    } finally {
      setBusyInline(null);
    }
  }
  async function inlineDueDate(taskId, due) {
    if (!canManage) return toast.info("Only owner/admin can set due date");
    setBusyInline(taskId);
    try {
      await api.patch(`/tasks/${taskId}/due-date`, { dueDate: due || null });
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update due date");
    } finally {
      setBusyInline(null);
    }
  }
  async function inlineReassign(taskId, username) {
    if (!canManage) return toast.info("Only owner/admin can reassign");
    setBusyInline(taskId);
    try {
      await api.patch(`/tasks/${taskId}/reassign`, { assigneeUsername: username.toLowerCase() });
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to reassign");
    } finally {
      setBusyInline(null);
    }
  }
  async function inlineDelete(taskId) {
    if (!canManage) return;
    if (!window.confirm("Delete this task?")) return;
    setBusyInline(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    } finally {
      setBusyInline(null);
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <BgAnim />

      <main className="relative max-w-7xl mx-auto px-6 pt-28 sm:pt-32 pb-16">
        
        <section className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <FaTasks /> Tasks
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Project: <span className="text-slate-200 font-semibold">{project?.name || "—"}</span>
              <span className="ml-3">Your role: <span className="text-slate-200 font-semibold">{role || "—"}</span></span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={`/projects/${projectId}`}
              className="rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
            >
              Back to Project
            </Link>
            {(role === "owner" || role === "admin") && (
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25"
              >
                <FaPlus /> New Task
              </button>
            )}
          </div>
        </section>

        
        {(role === "owner" || role === "admin") && (
          <section className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
            <div className="text-sm font-semibold mb-2">Quick assign</div>
            <div className="flex flex-wrap gap-2">
              {(project?.members || []).map((m) => (
                <button
                  key={m.username}
                  onClick={() => quickAssign(m.username)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
                  title={`Assign to @${m.username}`}
                >
                  <FaUserTag /> @{m.username} <span className="text-slate-400">({m.role})</span>
                </button>
              ))}
            </div>
          </section>
        )}

        
        <section className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <FaSearch className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadTasks())}
                placeholder="Search title/description…"
                className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-64 sm:w-80"
              />
              <button
                onClick={() => { setPage(1); loadTasks(); }}
                className="ml-2 rounded-lg border border-slate-800 px-2 py-1 text-xs"
              >
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              
              <label className="inline-flex items-center gap-2 text-sm ml-2">
                <input
                  type="checkbox"
                  className="accent-emerald-500"
                  checked={role === "member" ? true : onlyMine}
                  onChange={(e) => { if (role !== "member") { setOnlyMine(e.target.checked); setPage(1); } }}
                  disabled={role === "member"}
                />
                Only my tasks (@{meU || "—"})
              </label>
            </div>
          </div>
        </section>

        
        <section className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">Loading…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
              Failed to load tasks.
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-10 text-center">
              <div className="text-2xl font-semibold">No tasks</div>
              <p className="text-slate-400 mt-1">Try changing filters{(role==="owner"||role==="admin") ? " or create a new task." : "."}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((t) => (
                <div key={t._id} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-lg line-clamp-1">{t.title}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        <span className="mr-3"><FaUser className="inline mr-1" />Assignee: <span className="text-slate-200">@{t.assigneeId?.username || t.assigneeUsername || "—"}</span></span>
                        <span className="mr-3"><FaFlag className="inline mr-1" />Priority: <span className="text-slate-200">{t.priority}</span></span>
                        <span><FaCalendarAlt className="inline mr-1" />Due: <span className="text-slate-200">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</span></span>
                      </div>
                    </div>
                    <span className="ml-auto px-2 py-1 rounded-lg border border-slate-700 text-xs">{t.status}</span>
                  </div>

                  {t.description ? (
                    <p className="mt-2 text-sm text-slate-300 line-clamp-3">{t.description}</p>
                  ) : null}

                  {Array.isArray(t.labels) && t.labels.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {t.labels.map((lb, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-0.5">
                          <FaTag /> {lb}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tasks/${t._id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
                    >
                      <FaEye /> View
                    </Link>

                    {(role === "owner" || role === "admin") && (
                      <>
                        <div className="relative inline-block">
                          <details>
                            <summary className="list-none inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm cursor-pointer">
                              <FaChevronDown /> Status
                            </summary>
                            <div className="absolute z-10 mt-2 rounded-xl border border-slate-800/60 bg-slate-900/95 p-2 w-40">
                              {STATUSES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => inlineStatus(t._id, s)}
                                  className="w-full text-left rounded-lg px-2 py-1 hover:bg-slate-800 text-sm"
                                  disabled={busyInline === t._id}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        <div className="relative inline-block">
                          <details>
                            <summary className="list-none inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm cursor-pointer">
                              <FaChevronDown /> Priority
                            </summary>
                            <div className="absolute z-10 mt-2 rounded-xl border border-slate-800/60 bg-slate-900/95 p-2 w-40">
                              {PRIORITIES.map((p) => (
                                <button
                                  key={p}
                                  onClick={() => inlinePriority(t._id, p)}
                                  className="w-full text-left rounded-lg px-2 py-1 hover:bg-slate-800 text-sm"
                                  disabled={busyInline === t._id}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        <div className="relative inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm">
                          <FaCalendarAlt />
                          <input
                            type="date"
                            defaultValue={ymd(t.dueDate)}
                            onChange={(e) => inlineDueDate(t._id, e.target.value)}
                            className="bg-transparent outline-none"
                          />
                        </div>

                        <div className="relative inline-block">
                          <details>
                            <summary className="list-none inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm cursor-pointer">
                              <FaUserTag /> Reassign
                            </summary>
                            <div className="absolute z-10 mt-2 rounded-xl border border-slate-800/60 bg-slate-900/95 p-2 w-56 max-h-56 overflow-auto">
                              {(project?.members || []).map((m) => (
                                <button
                                  key={m.username}
                                  onClick={() => inlineReassign(t._id, m.username)}
                                  className="w-full text-left rounded-lg px-2 py-1 hover:bg-slate-800 text-sm"
                                  disabled={busyInline === t._id}
                                >
                                  @{m.username} <span className="text-slate-400">({m.role})</span>
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        <button
                          onClick={() => inlineDelete(t._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300 ml-auto"
                          disabled={busyInline === t._id}
                        >
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        
        <section className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">Page {page} of {pages}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-800/60 px-3 py-2 disabled:opacity-50"
            >
              <FaChevronLeft /> Prev
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="rounded-xl border border-slate-800/60 px-3 py-2 disabled:opacity-50"
            >
              Next <FaChevronRight />
            </button>
          </div>
        </section>
      </main>

      
      {openCreate && (
        <Modal onClose={() => setOpenCreate(false)}>
          <form onSubmit={onCreate} className="space-y-4">
            <h3 className="text-xl font-bold">Create Task</h3>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={onChangeForm}
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChangeForm}
                rows={4}
                placeholder="Describe the task"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Assignee (member)</label>
                <select
                  name="assigneeUsername"
                  value={form.assigneeUsername}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                >
                  <option value="">— Unassigned —</option>
                  {(project?.members || []).map((m) => (
                    <option key={m.username} value={m.username.toLowerCase()}>
                      @{m.username} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1 text-slate-300">Due date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Labels (comma separated)</label>
              <input
                name="labelsInput"
                value={form.labelsInput}
                onChange={onChangeForm}
                placeholder="bug, ui, v2"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpenCreate(false)} className="rounded-xl border border-slate-800 px-4 py-2">
                Cancel
              </button>
              <button
                disabled={busyCreate || !(role === "owner" || role === "admin")}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
              >
                {busyCreate ? "Creating…" : "Create Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-2 border border-slate-800/60"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
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


import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus, FaSearch, FaFolderOpen, FaUsers, FaCalendarAlt, FaTrash,
  FaEye, FaTimes, FaUserPlus, FaEdit, FaBell, FaCheckCircle
} from "react-icons/fa";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useUser();
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [archived, setArchived] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);

  const [projects, setProjects] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [busyCreate, setBusyCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [memberUsername, setMemberUsername] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("member");
  const [members, setMembers] = React.useState([]);

  const [openEdit, setOpenEdit] = React.useState(false);
  const [busyEdit, setBusyEdit] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [notifMap, setNotifMap] = React.useState({});
  const [notifRefreshing, setNotifRefreshing] = React.useState(false);

  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };
  const onChangeEditForm = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  React.useEffect(() => {
    const id = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, archived, page, limit]);

  React.useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications() {
    try {
      setNotifRefreshing(true);
      const res = await api.get("/notifications", {
        params: { unreadOnly: "true", limit: 100 },
      });
      const list = res?.data?.data?.notifications || [];
      const map = {};
      for (const n of list) {
        const pid = n?.ref?.projectId?._id || n?.ref?.projectId || null;
        if (!pid) continue;
        if (!map[pid]) map[pid] = { unreadCount: 0, items: [] };
        map[pid].unreadCount += n?.readAt ? 0 : 1;
        map[pid].items.push(n);
      }
      setNotifMap(map);
    } catch (err) {
      console.warn("Notification fetch failed:", err?.data?.message || err?.message || err);
    } finally {
      setNotifRefreshing(false);
    }
  }

  async function markOneNotifRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      await fetchNotifications();
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to mark as read");
    }
  }

  async function deleteOneNotif(id) {
    try {
      await api.delete(`/notifications/${id}`);
      await fetchNotifications();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  }

  async function markAllProjectNotifsRead(projectId) {
    const group = notifMap[projectId];
    if (!group?.items?.length) return;
    try {
      await Promise.all(group.items.map((n) => api.patch(`/notifications/${n._id}/read`)));
      await fetchNotifications();
      toast.success("All notifications for this project marked as read");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to mark all");
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/projects", {
        params: {
          page,
          limit,
          archived: archived ? "true" : "false",
          search: search || undefined,
        },
      });
      const list = res?.data?.data?.projects || [];
      const pg = res?.data?.data?.pagination || {};
      setProjects(list);
      setTotal(pg.total || list.length);
      setPages(pg.pages || 1);
      fetchNotifications(); 
    } catch (err) {
      setError(err);
      toast.error(err?.data?.message || err?.message || "Failed to load projects");
      if (err?.status === 401) nav("/login", { replace: true, state: { from: { pathname: "/dashboard" } } });
    } finally {
      setLoading(false);
    }
  }

  function resetCreate() {
    setForm({ name: "", description: "", startDate: "", endDate: "" });
    setMembers([]);
    setMemberUsername("");
    setMemberRole("member");
  }

  function addMemberChip() {
    const u = memberUsername.trim().toLowerCase();
    if (!u) return;
    if (!/^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/.test(u)) {
      toast.error("Invalid username format");
      return;
    }
    if (members.some((m) => m.username === u)) {
      toast.info("Already added");
      return;
    }
    setMembers((s) => [...s, { username: u, role: memberRole }]);
    setMemberUsername("");
    setMemberRole("member");
  }

  function removeMemberChip(idx) {
    setMembers((s) => s.filter((_, i) => i !== idx));
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end < start) {
        toast.error("End date must be after start date");
        return;
      }
    }
    setBusyCreate(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        members: members.length ? members : undefined,
      };
      const res = await api.post("/projects", payload);
      toast.success(res?.data?.message || "Project created");
      setOpenCreate(false);
      resetCreate();
      setPage(1);
      load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to create project");
    } finally {
      setBusyCreate(false);
    }
  }

  async function onDelete(id, canDelete) {
    if (!canDelete) return;
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await api.delete(`/projects/${id}`);
      toast.success(res?.data?.message || "Project deleted");
      load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  }

  
  function matchMe(m, myId, myUname) {
    const uname = (myUname || "").toLowerCase();
    const mmUid = m?.user?._id || m?.user;
    if (mmUid && myId && String(mmUid) === String(myId)) return true;
    if (m?.username && uname && m.username.toLowerCase() === uname) return true;
    return false;
  }
  function getUserIdAndUname(u) {
    const id = u?._id || u?.id || u?.data?.user?._id || u?.data?.user?.id || null;
    const uname = u?.username || u?.data?.user?.username || null;
    return { id, uname };
  }
  function roleOf(project, myId, myUsername) {
    const hit = (project?.members || []).find((m) => matchMe(m, myId, myUsername));
    return hit?.role || null;
  }
  function ownerUsername(project) {
    const cb = project?.createdBy;
    if (cb && typeof cb === "object" && cb.username) return cb.username;
    const own = (project?.members || []).find((m) => m.role === "owner");
    return own?.username || "unknown";
  }

  function openEditModal(project) {
    setEditId(project._id);
    setEditForm({
      name: project.name || "",
      description: project.description || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "",
    });
    setOpenEdit(true);
  }

  async function onEditSubmit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (editForm.startDate && editForm.endDate) {
      const start = new Date(editForm.startDate);
      const end = new Date(editForm.endDate);
      if (end < start) {
        toast.error("End date must be after start date");
        return;
      }
    }
    setBusyEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description?.trim() ?? "",
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
      };
      await api.put(`/projects/${editId}`, payload);
      toast.success("Project updated");
      setOpenEdit(false);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Update failed");
    } finally {
      setBusyEdit(false);
    }
  }

  const { id: myId, uname: myUname } = getUserIdAndUname(user);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <BgAnim />

      <main className="relative max-w-7xl mx-auto px-6 pt-28 sm:pt-32 pb-16">
        <section className="flex flex-wrap items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-slate-400 text-sm">
              Welcome{myUname ? `, @${myUname}` : ""}. Create a project and manage your work.
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold shadow-lg shadow-emerald-600/25"
            >
              <FaPlus /> New Project
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Total Projects" value={total} />
          <Stat label={archived ? "Viewing" : "Active View"} value={archived ? "Archived" : "Active"} subtle />
          <Stat label="Page" value={`${page}/${pages}`} subtle />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <FaSearch className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Search projects by name or description..."
                className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-64 sm:w-80"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-300 ml-auto">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={archived}
                onChange={(e) => { setPage(1); setArchived(e.target.checked); }}
              />
              Show Archived
            </label>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">Loading projects…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
              Failed to load projects.
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onNew={() => setOpenCreate(true)} />
          ) : (
            
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((p) => {
                const myRole = roleOf(p, myId, myUname);
                const canDelete = myRole === "owner";
                const canUpdate = myRole === "owner" || myRole === "admin";
                const pid = p._id;
                const projectNotifs = notifMap[pid] || { unreadCount: 0, items: [] };

                return (
                  <ProjectCard
                    key={pid}
                    project={p}
                    owner={ownerUsername(p)}
                    myRole={myRole}
                    onView={() => nav(`/projects/${pid}`)}
                    onDelete={() => onDelete(pid, canDelete)}
                    onUpdate={() => (canUpdate ? openEditModal(p) : toast.info("Only owner/admin can update"))}
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    notifUnread={projectNotifs.unreadCount}
                    notifItems={projectNotifs.items}
                    onNotifMarkOne={markOneNotifRead}
                    onNotifDeleteOne={deleteOneNotif}
                    onNotifMarkAll={() => markAllProjectNotifsRead(pid)}
                    notifRefreshing={notifRefreshing}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">Showing page {page} of {pages}</div>
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

      
      {openCreate && (
        <Modal onClose={() => setOpenCreate(false)}>
          <form onSubmit={onCreate} className="space-y-4">
            <h3 className="text-xl font-bold">Create Project</h3>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChangeForm}
                placeholder="Project name"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
              <div className="text-xs text-slate-500 mt-1">1–120 characters.</div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChangeForm}
                placeholder="What is this project about?"
                rows={4}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-300">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChangeForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-3">
              <div className="text-sm font-semibold mb-2">Add Members (optional)</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={memberUsername}
                  onChange={(e) => setMemberUsername(e.target.value)}
                  placeholder="username"
                  className="flex-1 min-w-[140px] rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  onClick={addMemberChip}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 px-3 py-2"
                >
                  <FaUserPlus /> Add
                </button>
              </div>
              {members.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((m, idx) => (
                    <span
                      key={`${m.username}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-sm"
                    >
                      @{m.username} <em className="not-italic text-slate-400">({m.role})</em>
                      <button
                        type="button"
                        onClick={() => removeMemberChip(idx)}
                        className="text-slate-400 hover:text-slate-200"
                        aria-label="Remove"
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpenCreate(false)} className="rounded-xl border border-slate-800 px-4 py-2">
                Cancel
              </button>
              <button
                disabled={busyCreate}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
              >
                {busyCreate ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      
      {openEdit && (
        <Modal onClose={() => setOpenEdit(false)}>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <h3 className="text-xl font-bold">Update Project</h3>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Name *</label>
              <input
                name="name"
                value={editForm.name}
                onChange={onChangeEditForm}
                placeholder="Project name"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Description</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={onChangeEditForm}
                rows={4}
                placeholder="Describe the project"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={editForm.startDate}
                  onChange={onChangeEditForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-300">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={editForm.endDate}
                  onChange={onChangeEditForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpenEdit(false)} className="rounded-xl border border-slate-800 px-4 py-2">
                Cancel
              </button>
              <button
                disabled={busyEdit}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
              >
                {busyEdit ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes slow-pan { 0% {transform:translateY(0)} 50% {transform:translateY(-10px)} 100% {transform:translateY(0)} }
        .animate-slow-pan { animation: slow-pan 14s ease-in-out infinite; }
        @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); opacity:.9 } 50% { transform:translate(10px,-10px) scale(1.05); opacity:1 } }
        .animate-orb { animation: orb 12s ease-in-out infinite; }
        .animate-orb-delayed { animation: orb 16s ease-in-out infinite; animation-delay:.8s; }
      `}</style>
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

function Stat({ label, value, subtle = false }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md p-4">
      <div className={`text-sm ${subtle ? "text-slate-400" : "text-slate-300"}`}>{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-10 text-center">
      <div className="text-5xl mb-3 text-slate-500"><FaFolderOpen /></div>
      <div className="text-lg font-semibold">No projects yet</div>
      <p className="text-slate-400 mt-1">Create your first project to get started.</p>
      <button
        onClick={onNew}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold shadow-lg shadow-emerald-600/25"
      >
        <FaPlus /> New Project
      </button>
    </div>
  );
}

const TYPE_LABEL = {
  task_assigned: "Task assigned",
  task_status_changed: "Task status changed",
  task_due_soon: "Task due soon",
  task_overdue: "Task overdue",
  comment_added: "New comment",
  project_member_added: "Member added",
  project_role_changed: "Role changed",
};

function ProjectCard({
  project,
  owner,
  myRole,
  onView,
  onDelete,
  onUpdate,
  canDelete,
  canUpdate,
  notifUnread = 0,
  notifItems = [],
  onNotifMarkOne,
  onNotifDeleteOne,
  onNotifMarkAll,
  notifRefreshing,
}) {
  const [openNotif, setOpenNotif] = React.useState(false);
  const members = project?.members || [];
  const membersCount = members.length;
  const start = project?.startDate ? new Date(project.startDate) : null;
  const end = project?.endDate ? new Date(project.endDate) : null;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-md p-4 flex flex-col relative">
      
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setOpenNotif((s) => !s)}
          className="relative inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
          title="Project notifications"
        >
          <FaBell className={notifRefreshing ? "animate-pulse" : ""} />
          {notifUnread > 0 && (
            <span className="ml-1 inline-flex items-center justify-center text-xs bg-rose-500 text-white rounded-full h-5 min-w-[20px] px-1">
              {notifUnread}
            </span>
          )}
        </button>

        
        {openNotif && (
          <div className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-slate-800/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-3 z-10">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-200">Notifications</div>
              <button
                onClick={() => setOpenNotif(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FaTimes />
              </button>
            </div>

            {notifUnread === 0 ? (
              <div className="text-sm text-slate-400 mt-3">No unread notifications for this project.</div>
            ) : (
              <>
                <ul className="mt-3 space-y-2 max-h-64 overflow-auto pr-1">
                  {notifItems.map((n) => {
                    const label = TYPE_LABEL[n?.type] || n?.type || "Notification";
                    const when = n?.createdAt ? new Date(n.createdAt).toLocaleString() : "";
                    const note =
                      n?.message || n?.title || (n?.ref?.taskId?.title ?? n?.ref?.projectId?.name) || "";
                    return (
                      <li
                        key={n._id}
                        className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-sm"
                      >
                        <div className="font-medium text-slate-100">{label}</div>
                        {note ? <div className="text-slate-300 mt-0.5">{note}</div> : null}
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                          <span>{when}</span>
                          <div className="flex items-center gap-2">
                            {!n.readAt && (
                              <button
                                onClick={() => onNotifMarkOne?.(n._id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-600/40 text-emerald-300"
                              >
                                <FaCheckCircle /> Read
                              </button>
                            )}
                            <button
                              onClick={() => onNotifDeleteOne?.(n._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-900/40 text-red-300"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3">
                  <button
                    onClick={onNotifMarkAll}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 px-3 py-2 text-sm font-semibold shadow-md"
                  >
                    <FaCheckCircle /> Mark all from this project read
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 pr-24">
        <div className="min-w-0">
          <div className="font-bold text-lg line-clamp-1">{project.name}</div>
          <div className="mt-0.5 text-xs text-slate-400">by @{owner}</div>
        </div>
        {project.archivedAt ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-amber-300">
            Archived
          </span>
        ) : null}
      </div>

      {project.description ? (
        <p className="mt-2 text-sm text-slate-300 line-clamp-3">{project.description}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-500 italic">No description</p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <Info icon={<FaUsers />} label="Members" value={String(membersCount)} />
        <Info
          icon={<FaCalendarAlt />}
          label="Dates"
          value={
            start
              ? `${start.toLocaleDateString()}${end ? " → " + end.toLocaleDateString() : ""}`
              : end
              ? `Until ${end.toLocaleDateString()}`
              : "—"
          }
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
          Role: {myRole || "—"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onView}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
          >
            <FaEye /> View
          </button>
          <button
            onClick={onUpdate}
            disabled={!canUpdate}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm disabled:opacity-50"
            title="Update (owner/admin)"
          >
            <FaEdit /> Update
          </button>
          <button
            onClick={canDelete ? onDelete : undefined}
            disabled={!canDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300 disabled:opacity-50"
            title="Delete (owner only)"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-slate-200">{value}</div>
      </div>
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
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
}

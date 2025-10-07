import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUsers, FaUserPlus, FaTrash, FaSignOutAlt,
  FaTasks, FaBullhorn, FaSearch, FaClock, FaFlag, FaList, FaUser, FaPlus, FaEdit, FaEye
} from "react-icons/fa";
import api from "../utils/api";
import { useUser } from "../contexts/AuthContext.jsx";



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

  const myId = idStr(me?.data?.user?._id || me?.data?.user?.id);
  const myUsername = unameStr(me?.data?.user?.username);

  const cbId = idStr(project?.createdBy?._id);
  const cbUsername = unameStr(
    typeof project?.createdBy === "object" ? project.createdBy?.username : project?.createdByUsername
  );
  if (myId && cbId && String(myId) === String(cbId)) return "owner";
  if (myUsername && cbUsername && myUsername === cbUsername) return "owner";

  const hit = (project?.members || []).find((m) => memberMatches(m, myId, myUsername));
  return hit?.role || null;
}
function isSelfMember(m, me) {
  const myId = idStr(me?._id || me?.id || me?.data?.user?._id);
  const myUsername = me?.username || me?.data?.user?.username;
  return memberMatches(m, myId, myUsername);
}


const PROJECT_STATUSES = ["pending", "done", "failed"];



export default function ProjectDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = React.useState(true);
  const [project, setProject] = React.useState(null);
  const [error, setError] = React.useState(null);

  const [addU, setAddU] = React.useState("");
  const [addRole, setAddRole] = React.useState("member");
  const [busyAdd, setBusyAdd] = React.useState(false);

  const [busyRole, setBusyRole] = React.useState(null);

  const [transferTo, setTransferTo] = React.useState("");
  const [busyTransfer, setBusyTransfer] = React.useState(false);

  const [busyLeave, setBusyLeave] = React.useState(false);

  
  const [busyProjStatus, setBusyProjStatus] = React.useState(false);

  
  const validTypes = [
    "task_assigned",
    "task_status_changed",
    "task_due_soon",
    "task_overdue",
    "comment_added",
    "project_member_added",
    "project_role_changed",
  ];
  const [notifyType, setNotifyType] = React.useState(validTypes[0]);
  const [notifyMsg, setNotifyMsg] = React.useState("");
  const [busyNotify, setBusyNotify] = React.useState(false);
  const isAppAdmin = Boolean(user?.data?.user?.isAdmin || user?.data?.user?.role === "admin");

  React.useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  
  async function fetchProjectStatus(pid) {
    if (!pid) return;
    try {
      
      const path = isAppAdmin ? `/admin/projects/${pid}/status` : `/projects/${pid}/status`;
      const res = await api.get(path);
      const st =
        res?.data?.data?.status ??
        res?.data?.data?.project?.projectStatus ??
        res?.data?.data?.projectStatus;
      if (st) {
        setProject((prev) => (prev ? { ...prev, projectStatus: st } : prev));
      }
    } catch (err) {
      // No hard fail—fallback to whatever came with /projects/:id
      // Useful if owner route isn't present or user lacks admin rights.
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/projects/${id}`);
      const p = res?.data?.data?.project || null;
      setProject(p);

      
      await fetchProjectStatus(p?._id || id);

      const mine = resolveMyRole(p, user);
      if (mine === "owner") {
        const candidates = (p?.members || []).filter((m) => !isSelfMember(m, user));
        setTransferTo(candidates[0]?.username || "");
      }

      
      setPage(1);
      await loadTasks({ page: 1, projectId: p?._id || id, forceRole: mine });
    } catch (err) {
      setError(err);
      toast.error(err?.data?.message || err?.message || "Failed to load project");
      if (err?.status === 404) nav("/error", { replace: true, state: { code: 404, title: "Project not found" } });
      if (err?.status === 401) nav("/login", { replace: true, state: { from: { pathname: `/projects/${id}` } } });
      if (err?.status === 403) nav("/error", { replace: true, state: { code: 403, title: "Access denied" } });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!project) return;
    const mine = resolveMyRole(project, user);
    if (mine === "owner") {
      const candidates = (project.members || []).filter((m) => !isSelfMember(m, user));
      setTransferTo((old) => old || (candidates[0]?.username || ""));
    }
  }, [project, user]);

  const role = project ? resolveMyRole(project, user) : null;
  const canAdd = role === "owner" || role === "admin";
  const canChangeRole = role === "owner";
  const canRemoveMember = (targetRole, isTargetSelf) =>
    role === "owner" ? targetRole !== "owner" && !isTargetSelf
    : role === "admin" ? targetRole === "member" && !isTargetSelf
    : false;

  
  const [tasks, setTasks] = React.useState([]);
  const [tLoading, setTLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);

  const [tSearch, setTSearch] = React.useState("");
  const [tStatus, setTStatus] = React.useState("");
  const [tPriority, setTPriority] = React.useState("");
  const [tAssignee, setTAssignee] = React.useState("");

  const canManageTasks = role === "owner" || role === "admin";
  const meU = (user?.data?.user?.username || "").toLowerCase();

  
  const [openTaskCreate, setOpenTaskCreate] = React.useState(false);
  const [busyTaskCreate, setBusyTaskCreate] = React.useState(false);
  const [taskForm, setTaskForm] = React.useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "medium",
    dueDate: "",
    assigneeUsername: "" 
  });
  const onChangeTaskForm = (e) => {
    const { name, value } = e.target;
    setTaskForm((s) => ({ ...s, [name]: value }));
  };

  async function loadTasks({ page: pg = page, projectId: pid = id, forceRole } = {}) {
    if (!pid) return;
    setTLoading(true);
    try {
      const params = {
        page: pg,
        limit: 20,
        search: tSearch || undefined,
        status: tStatus || undefined,
        priority: tPriority || undefined,
      };
      const myRole = forceRole || (project ? resolveMyRole(project, user) : null);
      
      if (!(myRole === "owner" || myRole === "admin")) {
        params.assigneeUsername = meU || undefined;
      } else if (tAssignee) {
        params.assigneeUsername = tAssignee;
      }

      const res = await api.get(`/projects/${pid}/tasks`, { params });
      const list = res?.data?.data?.tasks || [];
      const pgInfo = res?.data?.data?.pagination || {};
      setTasks(list);
      setPages(pgInfo.totalPages || 1);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to load tasks");
    } finally {
      setTLoading(false);
    }
  }

  React.useEffect(() => {
    if (!project?._id) return;
    loadTasks({ page, projectId: project._id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tStatus, tPriority, tAssignee]);

  function openCreateTaskFor(username = "") {
    if (!canManageTasks) return toast.info("Only owner/admin can create tasks");
    setTaskForm((s) => ({ ...s, assigneeUsername: String(username || "").toLowerCase() }));
    setOpenTaskCreate(true);
  }

  async function onCreateTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error("Title is required");
    setBusyTaskCreate(true);
    try {
      await api.post("/tasks", {
        projectId: project?._id || id,
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || "",
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        assigneeUsername: taskForm.assigneeUsername?.toLowerCase() || undefined,
        labels: undefined,
      });
      toast.success("Task created");
      setOpenTaskCreate(false);
      setTaskForm({
        title: "",
        description: "",
        status: "Todo",
        priority: "medium",
        dueDate: "",
        assigneeUsername: "",
      });
      setPage(1);
      await loadTasks({ page: 1, projectId: project?._id || id });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Create failed");
    } finally {
      setBusyTaskCreate(false);
    }
  }

  const changeTaskStatus = async (taskId, to) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: to });
      toast.success("Status updated");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Update failed");
    }
  };

  const changeTaskPriority = async (taskId, p) => {
    try {
      await api.patch(`/tasks/${taskId}/priority`, { priority: p });
      toast.success("Priority updated");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Update failed");
    }
  };

  const setTaskDue = async (taskId, dateStr) => {
    try {
      await api.patch(`/tasks/${taskId}/due-date`, { dueDate: dateStr || null });
      toast.success("Due date saved");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Save failed");
    }
  };

  const reassignTask = async (taskId) => {
    if (!canManageTasks) return;
    const u = prompt("Assign to username (project member):", tAssignee || "");
    if (!u) return;
    try {
      await api.patch(`/tasks/${taskId}/reassign`, { assigneeUsername: u.toLowerCase().trim() });
      toast.success("Reassigned");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Reassign failed");
    }
  };

  const deleteTask = async (taskId) => {
    if (!canManageTasks) return;
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      loadTasks();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  };

  
  async function addMember() {
    if (!canAdd) return toast.info("Only owner/admin can add members");
    const u = addU.trim().toLowerCase();
    if (!u) return toast.error("Username is required");
    if (!/^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/.test(u)) return toast.error("Invalid username format");
    setBusyAdd(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { username: u, role: addRole });
      toast.success(res?.data?.message || "Member added");
      setAddU("");
      setAddRole("member");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Add member failed");
    } finally {
      setBusyAdd(false);
    }
  }
  async function removeMember(username, targetRole, isTargetSelf) {
    if (!( (role === "owner" && targetRole !== "owner" && !isTargetSelf) || (role === "admin" && targetRole === "member" && !isTargetSelf) )) {
      return toast.info("You don't have permission to remove this member");
    }
    if (!window.confirm(`Remove @${username} from project?`)) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${encodeURIComponent(username)}`);
      toast.success(res?.data?.message || "Member removed");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Remove failed");
    }
  }
  async function changeRole(username, roleVal) {
    if (!(role === "owner")) return toast.info("Only owner can change roles");
    setBusyRole(username);
    try {
      const res = await api.patch(`/projects/${id}/members/${encodeURIComponent(username)}/role`, { role: roleVal });
      toast.success(res?.data?.message || "Role updated");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Role update failed");
    } finally {
      setBusyRole(null);
    }
  }
  async function transferOwnership() {
    if (role !== "owner") return toast.info("Only owner can transfer ownership");
    const u = transferTo.trim().toLowerCase();
    if (!u) return toast.error("Select a member to transfer ownership");
    if (!window.confirm(`Transfer ownership to @${u}?`)) return;
    setBusyTransfer(true);
    try {
      const res = await api.patch(`/projects/${id}/transfer-ownership`, { username: u });
      toast.success(res?.data?.message || "Ownership transferred");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Transfer failed");
    } finally {
      setBusyTransfer(false);
    }
  }
  async function leaveProject() {
    if (role === "owner") return toast.info("Owner cannot leave; transfer or delete the project.");
    if (!window.confirm("Leave this project?")) return;
    setBusyLeave(true);
    try {
      const res = await api.post(`/projects/${id}/leave`);
      toast.success(res?.data?.message || "You left the project");
      nav("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Leave failed");
    } finally {
      setBusyLeave(false);
    }
  }

  
  async function changeProjectStatus(newStatus) {
    if (!(role === "owner" || role === "admin")) return toast.info("Only owner/admin can change project status");
    if (!newStatus) return;
    setBusyProjStatus(true);
    try {
      // Admin hits admin route; owner hits non-admin route (if present)
      const endpoint = isAppAdmin ? `/admin/projects/${id}/status` : `/projects/${id}/status`;
      await api.patch(endpoint, { status: newStatus });
      toast.success("Project status updated");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update project status");
    } finally {
      setBusyProjStatus(false);
    }
  }

  
  async function sendNotification() {
    if (!isAppAdmin) return toast.info("Admin only");
    const message = String(notifyMsg || "").trim();
    if (!message) return toast.error("Message is required");
    if (message.length > 500) return toast.error("Max 500 chars");

    const memberIds = (project?.members || [])
      .map((m) => idStr(m?.user))
      .filter(Boolean);

    setBusyNotify(true);
    try {
      await api.post("/admin/notifications/broadcast", {
        type: notifyType,
        message,
        userIds: memberIds.length ? memberIds : undefined,
        entityType: "project",
        entityId: project?._id,
        projectId: project?._id,
        meta: { fromProject: project?._id }
      });
      toast.success("Notification sent");
      setNotifyMsg("");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to send notification");
    } finally {
      setBusyNotify(false);
    }
  }

  

  const projStatus = (typeof project?.status === "string" ? project.status : project?.projectStatus) || "pending";

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <BgAnim />

      <main className="relative max-w-7xl mx-auto px-6 pt-28 sm:pt-32 pb-16">
        {loading ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
            Loading project…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
            Failed to load project.
          </div>
        ) : !project ? null : (
          <>
            <section className="flex flex-wrap items-start gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {project.name}
                </h1>
                <div className="mt-1 text-slate-400 text-sm">
                  by @{(typeof project.createdBy === "object" && project.createdBy?.username)
                    ? project.createdBy.username
                    : (project.members || []).find(m => m.role === "owner")?.username || "unknown"} • Your role:{" "}
                  <span className="text-slate-200 font-semibold">{role || "—"}</span>
                  <span className="ml-2">• Status: <span className="px-2 py-0.5 rounded-lg border border-slate-700 text-slate-200">{projStatus}</span></span>
                  {project.archivedAt ? (
                    <span className="ml-2 text-amber-300">(Archived)</span>
                  ) : null}
                </div>

                {(role === "owner" || role === "admin") && (
                  <div className="mt-2">
                    <label className="text-xs text-slate-400 mr-2">Change project status:</label>
                    <select
                      defaultValue={projStatus}
                      onChange={(e)=>changeProjectStatus(e.target.value)}
                      disabled={busyProjStatus}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                    >
                      {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {project.description ? (
                  <p className="mt-3 text-slate-300 max-w-3xl">{project.description}</p>
                ) : null}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/notifications"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/60 px-4 py-2 text-sm"
                  title="All Notifications"
                >
                  <FaBullhorn /> All Notifications
                </Link>

                {role !== "owner" && (
                  <button
                    onClick={leaveProject}
                    disabled={busyLeave}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/60 px-4 py-2 text-sm disabled:opacity-50"
                  >
                    <FaSignOutAlt /> {busyLeave ? "Leaving…" : "Leave Project"}
                  </button>
                )}
              </div>
            </section>

            
            {isAppAdmin && (
              <section className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FaBullhorn /> Send Notification to Project Members
                </div>
                <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
                  <select
                    value={notifyType}
                    onChange={(e) => setNotifyType(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                  >
                    {validTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={notifyMsg}
                      onChange={(e) => setNotifyMsg(e.target.value)}
                      placeholder="message (1–500 chars)…"
                      className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                    <button
                      onClick={sendNotification}
                      disabled={busyNotify}
                      className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
                    >
                      {busyNotify ? "Sending…" : "Send"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaUsers /> Members
                </h2>
                <span className="text-slate-400 text-sm">({project.members?.length || 0})</span>
              </div>

              {canAdd && (
                <div className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FaUserPlus /> Add Member
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={addU}
                      onChange={(e) => setAddU(e.target.value)}
                      placeholder="username"
                      className="flex-1 min-w-[160px] rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    />
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={addMember}
                      disabled={busyAdd}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 px-3 py-2 disabled:opacity-50"
                    >
                      <FaUserPlus /> {busyAdd ? "Adding…" : "Add"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-3">
                {(project.members || []).map((m) => {
                  const uname = m.username;
                  const targetRole = m.role;
                  const self = isSelfMember(m, user);
                  const removeAllowed = ( (role === "owner" && targetRole !== "owner" && !self) ||
                                          (role === "admin" && targetRole === "member" && !self) );
                  const canSelectRole = role === "owner" && targetRole !== "owner";

                  return (
                    <div
                      key={uname}
                      className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 flex flex-wrap items-center gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">@{uname} {self ? <span className="text-xs text-emerald-400">(you)</span> : null}</div>
                      </div>

                      <span className="px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
                        Role: <span className="font-semibold">{targetRole}</span>
                      </span>

                      <button
                        onClick={() => openCreateTaskFor(uname)}
                        disabled={!canManageTasks}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm disabled:opacity-50"
                        title="Assign a task to this member"
                      >
                        <FaTasks /> Assign Task
                      </button>

                      {canSelectRole && (
                        <div className="ml-auto flex items-center gap-2">
                          <select
                            defaultValue={targetRole}
                            onChange={(e) => changeRole(uname, e.target.value)}
                            disabled={busyRole === uname}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm disabled:opacity-50"
                          >
                            <option value="member">member</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      )}

                      {removeAllowed && (
                        <button
                          onClick={() => removeMember(uname, targetRole, self)}
                          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300"
                        >
                          <FaTrash /> Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            
            <section className="mt-10">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaTasks /> Tasks
                </h2>
                <span className="text-slate-400 text-sm">({tasks.length})</span>
                <div className="ml-auto">
                  {canManageTasks && (
                    <button
                      onClick={() => openCreateTaskFor("")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25"
                    >
                      <FaPlus /> New Task
                    </button>
                  )}
                </div>
              </div>

              
              <div className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                    <FaSearch className="text-slate-400" />
                    <input
                      value={tSearch}
                      onChange={(e) => setTSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadTasks({ page: 1 }))}
                      placeholder="Search title/description…"
                      className="bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-64 sm:w-80"
                    />
                  </div>

                  <select
                    value={tStatus}
                    onChange={(e) => { setTStatus(e.target.value); setPage(1); }}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                  >
                    <option value="">All Status</option>
                    <option value="Todo">Todo</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  <select
                    value={tPriority}
                    onChange={(e) => { setTPriority(e.target.value); setPage(1); }}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                  >
                    <option value="">All Priority</option>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>

                  
                  <input
                    value={(canManageTasks ? tAssignee : meU)}
                    onChange={(e) => { if (canManageTasks) { setTAssignee(e.target.value.toLowerCase()); setPage(1); } }}
                    disabled={!canManageTasks}
                    placeholder={canManageTasks ? "assignee username" : `@${meU || "you"}`}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 disabled:opacity-60"
                  />

                  <button
                    onClick={() => { setPage(1); loadTasks({ page: 1 }); }}
                    className="ml-auto rounded-xl border border-slate-800 px-3 py-2"
                  >
                    Apply
                  </button>
                </div>
              </div>

              
              <section className="mt-4">
                {tLoading ? (
                  <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">Loading…</div>
                ) : tasks.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">No tasks</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {tasks.map((t) => {
                      const dueStr = t?.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—";
                      const asg = t?.assigneeId?.username || t?.assigneeUsername || "—";
                      return (
                        <div key={t._id} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-lg line-clamp-1">{t.title}</div>
                              <div className="text-xs text-slate-400">by @{t?.createdBy?.username || "unknown"}</div>
                            </div>
                            <Link
                              to={`/tasks/${t._id}`}
                              className="ml-auto inline-flex items-center gap-1 rounded-xl border border-slate-800/60 px-3 py-1 text-xs"
                            >
                              <FaEye /> View
                            </Link>
                          </div>

                          {t.description ? (
                            <p className="mt-2 text-sm text-slate-300 line-clamp-3">{t.description}</p>
                          ) : null}

                          <div className="mt-3 grid gap-2 text-sm text-slate-300">
                            <div className="flex items-center gap-2"><FaList /> Status: <strong>{t.status}</strong></div>
                            <div className="flex items-center gap-2"><FaFlag /> Priority: <strong>{t.priority}</strong></div>
                            <div className="flex items-center gap-2"><FaClock /> Due: <strong>{dueStr}</strong></div>
                            <div className="flex items-center gap-2"><FaUser /> Assignee: <strong>@{asg}</strong></div>
                          </div>

                          {canManageTasks && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <select
                                defaultValue={t.status}
                                onChange={(e) => changeTaskStatus(t._id, e.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                              >
                                <option value="Todo">Todo</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Done">Done</option>
                              </select>

                              <select
                                defaultValue={t.priority}
                                onChange={(e) => changeTaskPriority(t._id, e.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                              >
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                              </select>

                              <input
                                type="date"
                                defaultValue={t?.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : ""}
                                onChange={(e) => setTaskDue(t._id, e.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                              />

                              <button
                                onClick={() => reassignTask(t._id)}
                                className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
                              >
                                <FaEdit /> Reassign
                              </button>

                              <button
                                onClick={() => deleteTask(t._id)}
                                className="rounded-xl border border-red-900/40 px-3 py-2 text-sm text-red-300"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
            </section>
          </>
        )}
      </main>

      
      {openTaskCreate && canManageTasks && (
        <Modal onClose={() => setOpenTaskCreate(false)}>
          <form onSubmit={onCreateTask} className="space-y-4">
            <h3 className="text-xl font-bold">Create Task</h3>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Title *</label>
              <input
                name="title"
                value={taskForm.title}
                onChange={onChangeTaskForm}
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Description</label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={onChangeTaskForm}
                rows={4}
                placeholder="What needs to be done?"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Status</label>
                <select
                  name="status"
                  value={taskForm.status}
                  onChange={onChangeTaskForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                >
                  <option value="Todo">Todo</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-300">Priority</label>
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={onChangeTaskForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={onChangeTaskForm}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-300">Assignee Username</label>
                <input
                  name="assigneeUsername"
                  value={taskForm.assigneeUsername}
                  onChange={onChangeTaskForm}
                  placeholder="e.g. johndoe"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                />
                <div className="text-xs text-slate-500 mt-1">Must be a member of this project.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpenTaskCreate(false)} className="rounded-xl border border-slate-800 px-4 py-2">
                Cancel
              </button>
              <button
                disabled={busyTaskCreate}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
              >
                {busyTaskCreate ? "Creating…" : "Create Task"}
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

import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaChevronLeft, FaFlag, FaUser, FaCalendarAlt, FaList, FaTag } from "react-icons/fa";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useUser } from "../contexts/AuthContext.jsx";

const STATUSES = ["Todo", "In-Progress", "Done"];
const PROJECT_STATUSES = ["pending", "done", "failed"];

export default function TaskDetail(){
  const { taskId } = useParams();
  const nav = useNavigate();
  const { user } = useUser();

  const [task, setTask] = React.useState(null);
  const [project, setProject] = React.useState(null);
  const [role, setRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [denied, setDenied] = React.useState(false);

  const [busyStatus, setBusyStatus] = React.useState(false);
  const [busyProjStatus, setBusyProjStatus] = React.useState(false);

  const meU = (user?.data?.user?.username || "").toLowerCase();

  React.useEffect(()=>{ load(); /* eslint-disable-next-line */ },[taskId]);

  function idStr(x) {
    if (!x) return null;
    if (typeof x === "string") return x;
    if (typeof x === "object" && x._id) return String(x._id);
    try { return String(x); } catch { return null; }
  }
  function unameStr(x) { return (x || "").toLowerCase(); }
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

  async function load(){
    setLoading(true);
    setDenied(false);
    try{
      const res = await api.get(`/tasks/${taskId}`);
      const t = res?.data?.data?.task || null;
      setTask(t);

      if (!t) { setLoading(false); return; }

      
      const pid = t?.projectId?._id || t?.projectId;
      if (pid) {
        const pres = await api.get(`/projects/${pid}`);
        const p = pres?.data?.data?.project || null;
        setProject(p);

        const r = resolveMyRole(p, user);
        setRole(r);

        
        const assignedU = (t?.assigneeId?.username || t?.assigneeUsername || "").toLowerCase();
        if (!(r === "owner" || r === "admin")) {
          if (!assignedU || assignedU !== meU) {
            setDenied(true);
          }
        }
      }
    }catch(err){
      toast.error(err?.data?.message || err?.message || "Failed to load task");
    }finally{
      setLoading(false);
    }
  }

  async function changeStatus(next) {
    if (!(role === "owner" || role === "admin")) return;
    if (!next || next === task?.status) return;
    setBusyStatus(true);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: next });
      toast.success("Task status updated");
      await load(); 
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update status");
    } finally {
      setBusyStatus(false);
    }
  }

  
  const projStatus = (typeof project?.status === "string" ? project.status : project?.projectStatus) || "pending";
  async function changeProjectStatus(newStatus) {
    if (!(role === "owner" || role === "admin")) return;
    if (!newStatus || newStatus === projStatus) return;
    setBusyProjStatus(true);
    try {
      await api.patch(`/projects/${project?._id || task?.projectId}/status`, { status: newStatus });
      toast.success("Project status updated");
      await load();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update project status");
    } finally {
      setBusyProjStatus(false);
    }
  }

  const labels = Array.isArray(task?.labels) ? task.labels : [];
  const createdAt = task?.createdAt ? new Date(task.createdAt) : null;
  const updatedAt = task?.updatedAt ? new Date(task.updatedAt) : null;
  const lastChanged = task?.lastStatusChangedAt ? new Date(task.lastStatusChangedAt) : null;

  const canManage = role === "owner" || role === "admin";

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <main className="relative max-w-5xl mx-auto px-6 pt-28 sm:pt-32 pb-16">
        <button
          onClick={()=>nav(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
        >
          <FaChevronLeft /> Back
        </button>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
            Loading…
          </div>
        ) : denied ? (
          <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/40 p-8 text-center text-red-200">
            You don’t have permission to view this task.
          </div>
        ) : !task ? (
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 text-center">
            Task not found
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 animate-fade-up">
            <div className="flex items-start gap-3">
              <h1 className="text-2xl font-extrabold flex-1">{task.title}</h1>
              {project?._id && (
                <Link
                  to={`/projects/${project._id}`}
                  className="rounded-xl border border-slate-800/60 px-3 py-2 text-sm"
                >
                  View Project
                </Link>
              )}
            </div>

            {task.description ? <p className="mt-2 text-slate-300">{task.description}</p> : null}

            <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div><FaList className="inline mr-2" />Status: <strong>{task.status}</strong></div>
              <div><FaFlag className="inline mr-2" />Priority: <strong>{task.priority}</strong></div>
              <div><FaUser className="inline mr-2" />Assignee: <strong>@{task?.assigneeId?.username || task?.assigneeUsername || "—"}</strong></div>
              <div><FaUser className="inline mr-2" />Created by: <strong>@{task?.createdBy?.username || "—"}</strong></div>
              {task?.dueDate ? <div><FaCalendarAlt className="inline mr-2" />Due: <strong>{new Date(task.dueDate).toLocaleString()}</strong></div> : <div><FaCalendarAlt className="inline mr-2" />Due: <strong>—</strong></div>}
              {lastChanged ? <div>Last status change: <strong>{lastChanged.toLocaleString()}</strong></div> : null}
              {createdAt ? <div>Created: <strong>{createdAt.toLocaleString()}</strong></div> : null}
              {updatedAt ? <div>Updated: <strong>{updatedAt.toLocaleString()}</strong></div> : null}
              <div>Project status: <strong>{projStatus}</strong></div>
            </div>

            
            {canManage && (
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm">
                  <span className="text-slate-300">Change task status</span>
                  <select
                    defaultValue={task.status}
                    onChange={(e)=>changeStatus(e.target.value)}
                    disabled={busyStatus}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>

                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 px-3 py-2 text-sm">
                  <span className="text-slate-300">Change project status</span>
                  <select
                    defaultValue={projStatus}
                    onChange={(e)=>changeProjectStatus(e.target.value)}
                    disabled={busyProjStatus}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1"
                  >
                    {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            )}

            {Array.isArray(task?.labels) && task.labels.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-2">Labels</div>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((lb, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs">
                      <FaTag /> {lb}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(task?.statusHistory) && task.statusHistory.length > 0 && (
              <div className="mt-6">
                <div className="font-semibold mb-2">Status History</div>
                <ul className="space-y-1 text-sm text-slate-300">
                  {task.statusHistory.map((h, i)=>(
                    <li key={i} className="transition transform hover:translate-x-1">
                      {new Date(h.at).toLocaleString()} — {h.from || "∅"} → {h.to}
                      {h?.by?.username ? ` by @${h.by.username}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-up { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
        .animate-fade-up { animation: fade-up .35s ease-out both; }
      `}</style>
    </div>
  );
}

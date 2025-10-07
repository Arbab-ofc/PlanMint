
import React from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import { createContact } from "../utils/contactsApi";

export default function MessageModal({
  open,
  onClose,
  projectId,     
  toUsername,    
  onSent,        
}) {
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) setMessage("");
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    const body = message.trim();
    if (!body) {
      toast.error("Message is required");
      return;
    }
    setBusy(true);
    try {
      
      const payload = {
        name: `@${toUsername}`, 
        notes: body,            
        projects: [projectId],  
      };
      await createContact(payload);
      toast.success("Message sent");
      onSent?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to send");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800/70 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-2 border border-slate-800/60"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h3 className="text-xl font-bold">Message @{toUsername}</h3>
        <p className="text-sm text-slate-400 mt-1">
          This will be saved as a message entry for this project.
        </p>

        <div className="mt-4">
          <label className="block text-sm mb-1 text-slate-300">Message *</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message…"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-800 px-4 py-2">
            Cancel
          </button>
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
          >
            <FaPaperPlane /> {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

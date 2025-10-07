
import React from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import { createContact } from "../utils/contactsApi";

export default function ContactComposeModal({
  open,
  onClose,
  projectId,              
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  defaultTags = [],
  defaultNotes = "",
  onCreated,              
}) {
  const [name, setName] = React.useState(defaultName);
  const [email, setEmail] = React.useState(defaultEmail);
  const [phone, setPhone] = React.useState(defaultPhone);
  const [tags, setTags] = React.useState(defaultTags);
  const [tagInput, setTagInput] = React.useState("");
  const [notes, setNotes] = React.useState(defaultNotes);
  const [linkProject] = React.useState(!!projectId); 
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(defaultName || "");
      setEmail(defaultEmail || "");
      setPhone(defaultPhone || "");
      setTags(defaultTags || []);
      setNotes(defaultNotes || "");
      setTagInput("");
    }
  }, [open, defaultName, defaultEmail, defaultPhone, defaultTags, defaultNotes]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((s) => [...s, t]);
    setTagInput("");
  }
  function removeTag(t) {
    setTags((s) => s.filter((x) => x !== t));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        email: email || undefined,
        phone: phone || undefined,
        tags: tags.length ? tags : undefined,
        notes: notes || undefined,
        projects: projectId ? [projectId] : undefined,
      };
      const res = await createContact(payload);
      const contact = res?.data?.data?.contact;
      toast.success(res?.data?.message || "Contact created");
      onCreated?.(contact);
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to create contact");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <div className="absolute inset-0 bg-black/60 z-0" onClick={onClose} />
      
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800/70 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl text-slate-100"
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
        <h3 className="text-xl font-bold">Create Contact</h3>
        <p className="text-sm text-slate-400 mt-1">
          Save a contact (duplicates allowed) and auto-link to the project if opened from a project.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm mb-1 text-slate-300">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name / @username"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-300">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555…"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Tags</label>
            <div className="flex items-center gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="press + to add"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl border border-emerald-600/40 px-3 py-2"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-sm">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra info…"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none resize-y"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-800 px-4 py-2">
            Cancel
          </button>
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold shadow-lg shadow-emerald-600/25 disabled:opacity-60"
          >
            <FaPaperPlane /> {busy ? "Saving…" : "Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

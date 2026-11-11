import { useState } from "react";
import { Clock, Download, Mail, MapPin, Phone, Plus, Search, Trash2 } from "lucide-react";
import { staffDirectory } from "../lib/pdf.js";
import { btnGhost, btnPrimary, inputCls, Label, Modal } from "./ui.jsx";

const blank = { name: "", role: "Teacher", department: "", email: "", phone: "", room: "", hours: "" };

export default function Staff({ staff, setStaff, notify }) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");

  const depts = ["All", ...Array.from(new Set(staff.map((s) => s.department))).sort()];
  const rows = staff.filter(
    (m) =>
      (dept === "All" || m.department === dept) &&
      `${m.name} ${m.role} ${m.department}`.toLowerCase().includes(query.toLowerCase())
  );

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.department.trim()) return setErr("Name and department are required.");
    const id = "T" + String(Date.now()).slice(-5);
    setStaff((prev) => [
      ...prev,
      {
        ...f,
        id,
        name: f.name.trim(),
        department: f.department.trim(),
        email: f.email || f.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@edusphere.school",
      },
    ]);
    setAdding(false);
    setF(blank);
    setErr("");
    notify("Staff member added");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Staff directory</h2>
          <p className="text-sm text-slate-500">{staff.length} staff members</p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => staffDirectory(staff)}>
            <Download size={16} /> PDF
          </button>
          <button className={btnPrimary} onClick={() => setAdding(true)}>
            <Plus size={16} /> Add staff
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search name, role or department" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className={`${inputCls} sm:w-52`} value={dept} onChange={(e) => setDept(e.target.value)}>
          {depts.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All departments" : d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
                {m.name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/, "").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{m.name}</p>
                <p className="text-sm text-slate-500">{m.role}</p>
                <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{m.department}</span>
              </div>
              <button
                title="Remove"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => {
                  if (window.confirm(`Remove ${m.name} from the directory?`)) {
                    setStaff((prev) => prev.filter((x) => x.id !== m.id));
                    notify("Staff member removed");
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2 break-all">
                <Mail size={14} className="shrink-0 text-slate-400" /> {m.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-slate-400" /> {m.phone || "-"}
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-slate-400" /> {m.room || "-"}
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-slate-400" /> {m.hours || "-"}
              </li>
            </ul>
          </div>
        ))}
        {!rows.length && <p className="col-span-full py-10 text-center text-slate-500">No staff match your search.</p>}
      </div>

      {adding && (
        <Modal title="Add staff member" onClose={() => setAdding(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Full name"],
                ["role", "Role"],
                ["department", "Department"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["room", "Room / location"],
              ].map(([k, label]) => (
                <div key={k}>
                  <Label htmlFor={"st-" + k}>{label}</Label>
                  <input id={"st-" + k} className={inputCls} value={f[k]} onChange={set(k)} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label htmlFor="st-hours">Office hours</Label>
                <input id="st-hours" className={inputCls} value={f.hours} onChange={set("hours")} placeholder="Mon-Fri 2:00-4:00" />
              </div>
            </div>
            {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className={btnGhost} onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button type="submit" className={btnPrimary}>
                Add staff
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

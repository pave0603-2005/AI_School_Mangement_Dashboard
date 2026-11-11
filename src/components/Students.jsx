import { useMemo, useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { SUBJECTS } from "../data/seed.js";
import { average, computeGPA, fmtGPA, gpaTone, nextStudentId, scoreToLetter } from "../lib/academic.js";
import { studentReport } from "../lib/pdf.js";
import { btnGhost, btnPrimary, Card, inputCls, Label, Modal } from "./ui.jsx";

const emptyForm = (students) => ({
  id: nextStudentId(students),
  name: "",
  cls: "10-A",
  gender: "Male",
  dob: "",
  email: "",
  guardian: "",
  phone: "",
  bus: "BUS-1",
  attendance: 90,
  grades: Object.fromEntries(SUBJECTS.map((s) => [s.name, ""])),
});

function StudentForm({ initial, onSave, onClose, isEdit }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setGrade = (k) => (e) => setF((p) => ({ ...p, grades: { ...p.grades, [k]: e.target.value } }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Student name is required.");
    const att = Number(f.attendance);
    if (Number.isNaN(att) || att < 0 || att > 100) return setErr("Attendance must be between 0 and 100.");
    for (const [k, v] of Object.entries(f.grades)) {
      if (v !== "" && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)) return setErr(`${k} score must be between 0 and 100.`);
    }
    const grades = {};
    Object.entries(f.grades).forEach(([k, v]) => {
      if (v !== "") grades[k] = Number(v);
    });
    onSave({
      ...f,
      name: f.name.trim(),
      attendance: att,
      grades,
      email: f.email || f.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@edusphere.school",
    });
  };

  return (
    <Modal title={isEdit ? "Edit student" : "Add student"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sname">Full name</Label>
            <input id="sname" className={inputCls} value={f.name} onChange={set("name")} />
          </div>
          <div>
            <Label htmlFor="scls">Class</Label>
            <input id="scls" className={inputCls} value={f.cls} onChange={set("cls")} placeholder="10-A" />
          </div>
          <div>
            <Label htmlFor="sgen">Gender</Label>
            <select id="sgen" className={inputCls} value={f.gender} onChange={set("gender")}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sdob">Date of birth</Label>
            <input id="sdob" type="date" className={inputCls} value={f.dob} onChange={set("dob")} />
          </div>
          <div>
            <Label htmlFor="sguard">Guardian</Label>
            <input id="sguard" className={inputCls} value={f.guardian} onChange={set("guardian")} />
          </div>
          <div>
            <Label htmlFor="sphone">Phone</Label>
            <input id="sphone" className={inputCls} value={f.phone} onChange={set("phone")} />
          </div>
          <div>
            <Label htmlFor="semail">Email</Label>
            <input id="semail" type="email" className={inputCls} value={f.email} onChange={set("email")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sbus">Bus</Label>
              <select id="sbus" className={inputCls} value={f.bus} onChange={set("bus")}>
                <option value="">None</option>
                <option>BUS-1</option>
                <option>BUS-2</option>
                <option>BUS-3</option>
              </select>
            </div>
            <div>
              <Label htmlFor="satt">Attendance %</Label>
              <input id="satt" type="number" className={inputCls} value={f.attendance} onChange={set("attendance")} />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Grades (0-100)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SUBJECTS.map((s) => (
              <div key={s.name}>
                <Label htmlFor={"g-" + s.name}>{s.name}</Label>
                <input id={"g-" + s.name} type="number" className={inputCls} value={f.grades[s.name] ?? ""} onChange={setGrade(s.name)} />
              </div>
            ))}
          </div>
        </div>

        {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {isEdit ? "Save changes" : "Add student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StudentDetail({ student, onClose }) {
  const gpa = computeGPA(student.grades);
  const avg = average(student.grades);
  return (
    <Modal title={student.name} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Student ID", student.id],
          ["Class", student.cls],
          ["Gender", student.gender],
          ["Date of birth", student.dob || "-"],
          ["Guardian", student.guardian || "-"],
          ["Phone", student.phone || "-"],
          ["Email", student.email || "-"],
          ["Bus", student.bus || "None"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{k}</p>
            <p className="break-words font-medium text-slate-800">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-xl bg-indigo-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-indigo-600">GPA</p>
          <p className="text-3xl font-bold text-indigo-800">{fmtGPA(gpa)}</p>
        </div>
        <div className="text-sm text-indigo-900">
          <p>Average score: {avg === null ? "N/A" : avg.toFixed(1) + "%"}</p>
          <p>Attendance: {student.attendance}%</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {Object.entries(student.grades).map(([k, v]) => (
          <div key={k}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-600">{k}</span>
              <span className="font-semibold">
                {v}% · {scoreToLetter(v)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${v >= 75 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
        {!Object.keys(student.grades).length && <p className="text-sm text-slate-500">No grades recorded yet.</p>}
      </div>

      <div className="mt-6 flex justify-end">
        <button className={btnPrimary} onClick={() => studentReport(student)}>
          <Download size={16} /> Download PDF report
        </button>
      </div>
    </Modal>
  );
}

export default function Students({ students, setStudents, notify }) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("All");
  const [editing, setEditing] = useState(null); // {data, isEdit}
  const [viewing, setViewing] = useState(null);

  const classes = useMemo(() => ["All", ...Array.from(new Set(students.map((s) => s.cls))).sort()], [students]);

  const rows = students.filter(
    (s) =>
      (cls === "All" || s.cls === cls) &&
      (s.name.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()))
  );

  const save = (data) => {
    if (editing.isEdit) {
      setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      notify("Student updated");
    } else {
      setStudents((prev) => [...prev, data]);
      notify("Student added");
    }
    setEditing(null);
  };

  const del = (s) => {
    if (window.confirm(`Delete ${s.name}? This cannot be undone.`)) {
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
      notify("Student deleted");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Students</h2>
          <p className="text-sm text-slate-500">{students.length} students on record, saved to your browser.</p>
        </div>
        <button className={btnPrimary} onClick={() => setEditing({ data: emptyForm(students), isEdit: false })}>
          <Plus size={16} /> Add student
        </button>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input className={`${inputCls} pl-9`} placeholder="Search by name or ID" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className={`${inputCls} sm:w-40`} value={cls} onChange={(e) => setCls(e.target.value)}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All classes" : "Class " + c}
              </option>
            ))}
          </select>
        </div>

        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-3">Student</th>
                <th className="pb-3">Class</th>
                <th className="pb-3">GPA</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Bus</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const g = computeGPA(s.grades);
                return (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{s.cls}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${gpaTone(g)}`}>{fmtGPA(g)}</span>
                    </td>
                    <td className={`py-3 font-medium ${s.attendance < 80 ? "text-rose-600" : "text-slate-700"}`}>{s.attendance}%</td>
                    <td className="py-3">{s.bus || "-"}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button title="View" onClick={() => setViewing(s)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                          <Eye size={16} />
                        </button>
                        <button title="PDF report" onClick={() => studentReport(s)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600">
                          <Download size={16} />
                        </button>
                        <button title="Edit" onClick={() => setEditing({ data: { ...s, grades: { ...Object.fromEntries(SUBJECTS.map((x) => [x.name, ""])), ...s.grades } }, isEdit: true })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-amber-600">
                          <Pencil size={16} />
                        </button>
                        <button title="Delete" onClick={() => del(s)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && <StudentForm initial={editing.data} isEdit={editing.isEdit} onSave={save} onClose={() => setEditing(null)} />}
      {viewing && <StudentDetail student={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

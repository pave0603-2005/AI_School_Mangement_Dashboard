import { useState } from "react";
import { BarChart3, Bus, Download, FileText, Users } from "lucide-react";
import { SUBJECTS } from "../data/seed.js";
import { average, computeGPA, creditsFor, fmtGPA, scoreToLetter } from "../lib/academic.js";
import { schoolReport, staffDirectory, studentReport, transportReport } from "../lib/pdf.js";
import { btnPrimary, Card, inputCls } from "./ui.jsx";

export default function Reports({ students, staff, buses, notify }) {
  const [id, setId] = useState(students[0] ? students[0].id : "");
  const student = students.find((s) => s.id === id) || students[0];

  const run = (fn, label) => () => {
    try {
      fn();
      notify(`${label} downloaded`);
    } catch (e) {
      notify("Could not generate the PDF", "error");
    }
  };

  const cards = [
    { icon: BarChart3, title: "School performance summary", desc: "Ranking, GPA, attendance and subject averages for all students.", fn: run(() => schoolReport(students), "School summary"), tone: "bg-indigo-100 text-indigo-600" },
    { icon: Users, title: "Staff directory", desc: "Names, roles, departments and contact details.", fn: run(() => staffDirectory(staff), "Staff directory"), tone: "bg-sky-100 text-sky-600" },
    { icon: Bus, title: "Transport status", desc: "Current speed, delay and occupancy for every bus.", fn: run(() => transportReport(buses), "Transport report"), tone: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">Generate PDF reports instantly from your current data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon size={22} />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{c.desc}</p>
            <button className={`${btnPrimary} mt-4`} onClick={c.fn}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        ))}
      </div>

      <Card title="Student report card" subtitle="Preview and download an individual report">
        {student ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <select className={`${inputCls} sm:max-w-xs`} value={student.id} onChange={(e) => setId(e.target.value)}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.cls})
                  </option>
                ))}
              </select>
              <button className={btnPrimary} onClick={run(() => studentReport(student), "Report card")}>
                <FileText size={16} /> Generate PDF report
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-lg font-bold">{student.name}</p>
                  <p className="text-sm text-slate-500">
                    {student.id} · Class {student.cls} · Attendance {student.attendance}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-slate-500">GPA</p>
                  <p className="text-3xl font-bold text-indigo-700">{fmtGPA(computeGPA(student.grades))}</p>
                </div>
              </div>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Subject</th>
                    <th className="py-2">Credits</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.filter((s) => student.grades[s.name] !== undefined).map((s) => (
                    <tr key={s.name} className="border-t border-slate-100">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{creditsFor(s.name)}</td>
                      <td className="py-2">{student.grades[s.name]}%</td>
                      <td className="py-2 font-semibold">{scoreToLetter(student.grades[s.name])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-sm text-slate-500">
                Average score: {average(student.grades) === null ? "N/A" : average(student.grades).toFixed(1) + "%"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Add a student to generate reports.</p>
        )}
      </Card>
    </div>
  );
}

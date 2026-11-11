import { Bus, ClipboardCheck, GraduationCap, Megaphone, Trophy, Users } from "lucide-react";
import { SUBJECTS, ANNOUNCEMENTS } from "../data/seed.js";
import { average, computeGPA, fmtGPA, gpaTone } from "../lib/academic.js";
import { Card, StatCard } from "./ui.jsx";

export default function Dashboard({ user, students, staff, buses, ocrHistory, go }) {
  const gpas = students.map((s) => ({ s, g: computeGPA(s.grades) })).filter((x) => x.g !== null);
  const avgGpa = gpas.reduce((a, x) => a + x.g, 0) / (gpas.length || 1);
  const avgAtt = students.reduce((a, s) => a + Number(s.attendance || 0), 0) / (students.length || 1);
  const top = [...gpas].sort((a, b) => b.g - a.g).slice(0, 5);

  const buckets = [
    { label: "3.5 - 4.0", test: (g) => g >= 3.5, color: "bg-emerald-500" },
    { label: "2.5 - 3.4", test: (g) => g >= 2.5 && g < 3.5, color: "bg-sky-500" },
    { label: "1.7 - 2.4", test: (g) => g >= 1.7 && g < 2.5, color: "bg-amber-500" },
    { label: "Below 1.7", test: (g) => g < 1.7, color: "bg-rose-500" },
  ].map((b) => ({ ...b, count: gpas.filter((x) => b.test(x.g)).length }));
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const subjAvg = SUBJECTS.map((sub) => {
    const vals = students.map((s) => Number(s.grades?.[sub.name])).filter((n) => !Number.isNaN(n));
    return { name: sub.name, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
  });

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow">
        <p className="text-sm text-indigo-100">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <h2 className="mt-1 text-2xl font-bold">
          {greet}, {user.name.split(" ")[0]}!
        </h2>
        <p className="mt-1 text-indigo-100">
          {buses.filter((b) => b.status === "Heavy traffic").length} bus(es) in traffic · {students.filter((s) => s.attendance < 80).length} student(s) with low attendance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label="Students" value={students.length} hint={`${new Set(students.map((s) => s.cls)).size} classes`} />
        <StatCard icon={Users} label="Staff" value={staff.length} hint="Teachers & admin" tone="sky" />
        <StatCard icon={Trophy} label="Average GPA" value={fmtGPA(gpas.length ? avgGpa : null)} hint="4.0 scale" tone="emerald" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${avgAtt.toFixed(1)}%`} hint="School average" tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="GPA distribution" subtitle="Students per GPA band" className="lg:col-span-1">
          <div className="space-y-4">
            {buckets.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{b.label}</span>
                  <span className="font-semibold">{b.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${b.color} transition-all duration-700`} style={{ width: `${(b.count / maxBucket) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Subject averages" subtitle="Across all students" className="lg:col-span-1">
          <div className="space-y-3">
            {subjAvg.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{s.name}</span>
                  <span className="font-semibold">{s.avg.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${s.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Top performers"
          subtitle="Ranked by GPA"
          className="lg:col-span-1"
          action={
            <button onClick={() => go("students")} className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </button>
          }
        >
          <ul className="space-y-3">
            {top.map((x, i) => (
              <li key={x.s.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{x.s.name}</p>
                  <p className="text-xs text-slate-500">Class {x.s.cls}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${gpaTone(x.g)}`}>{fmtGPA(x.g)}</span>
              </li>
            ))}
            {!top.length && <li className="text-sm text-slate-500">No graded students yet.</li>}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Live transport"
          subtitle="Simulated GPS feed"
          className="lg:col-span-2"
          action={
            <button onClick={() => go("bus")} className="text-xs font-semibold text-indigo-600 hover:underline">
              Open tracker
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {buses.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-slate-800">
                    <Bus size={16} style={{ color: b.route.color }} /> {b.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      b.status === "Heavy traffic" ? "bg-rose-100 text-rose-700" : b.status === "Arrived" ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {Math.round(b.speed)} <span className="text-sm font-medium text-slate-500">km/h</span>
                </p>
                <p className="text-xs text-slate-500">
                  Delay {b.delay.toFixed(1)} min · ETA {Math.max(0, Math.round(b.etaMin))} min
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${b.frac * 100}%`, background: b.route.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Announcements" subtitle="Latest from the office">
          <ul className="space-y-3">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Megaphone size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.tag} · {a.when}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Recent document scans"
        subtitle="From the OCR module"
        action={
          <button onClick={() => go("ocr")} className="text-xs font-semibold text-indigo-600 hover:underline">
            Scan a document
          </button>
        }
      >
        {ocrHistory.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2">Document</th>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {ocrHistory.slice(0, 5).map((h) => (
                  <tr key={h.id} className="border-t border-slate-100">
                    <td className="py-2 font-medium">{h.file}</td>
                    <td className="py-2">{h.student}</td>
                    <td className="py-2">{h.type}</td>
                    <td className="py-2 text-slate-500">{new Date(h.at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No scans yet. Use the OCR module to extract data from a student document.</p>
        )}
      </Card>
    </div>
  );
}

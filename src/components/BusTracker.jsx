import { useState } from "react";
import { AlertTriangle, Bus, Clock, Download, Gauge, MapPin, RotateCcw, Users } from "lucide-react";
import { MAP_H, MAP_W, ROUTES, SCHOOL, pathString, pointAt, sliceRoute } from "../data/routes.js";
import { transportReport } from "../lib/pdf.js";
import { btnGhost, btnPrimary, Card } from "../components/ui.jsx";

function statusTone(s) {
  if (s === "Heavy traffic") return "bg-rose-100 text-rose-700";
  if (s === "Boarding") return "bg-sky-100 text-sky-700";
  if (s === "Arrived") return "bg-slate-200 text-slate-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function BusTracker({ sim, students }) {
  const { buses, triggerJam, clearJam, reset } = sim;
  const [selectedId, setSelectedId] = useState(buses[0].id);
  const sel = buses.find((b) => b.id === selectedId) || buses[0];
  const riders = students.filter((s) => s.bus === sel.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">School bus tracking</h2>
          <p className="text-sm text-slate-500">Simulated live GPS feed · updates every second · morning pickup routes</p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={reset}>
            <RotateCcw size={16} /> Restart
          </button>
          <button className={btnPrimary} onClick={() => transportReport(buses)}>
            <Download size={16} /> PDF report
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Live map" subtitle="Red segments mark traffic congestion">
          <div className="overflow-hidden rounded-xl bg-emerald-50 ring-1 ring-slate-200">
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full" role="img" aria-label="Bus route map">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1fae5" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={MAP_W} height={MAP_H} fill="#ecfdf5" />
              <rect width={MAP_W} height={MAP_H} fill="url(#grid)" />
              <ellipse cx="170" cy="250" rx="70" ry="40" fill="#bae6fd" opacity="0.8" />
              <ellipse cx="760" cy="420" rx="90" ry="50" fill="#bbf7d0" />
              <ellipse cx="600" cy="480" rx="60" ry="30" fill="#bae6fd" opacity="0.8" />

              {ROUTES.map((r) => (
                <g key={r.id}>
                  <polyline points={pathString(r)} fill="none" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pathString(r)} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pathString(r)} fill="none" stroke={r.color} strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" strokeLinejoin="round" />
                  {r.zones.map((z, i) => (
                    <polyline key={i} points={sliceRoute(r, z.from, z.to)} fill="none" stroke="#ef4444" strokeOpacity="0.85" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                </g>
              ))}

              {buses.map((b) =>
                b.route.stops.map((s) => {
                  const p = pointAt(b.route, s.at * b.route.length);
                  return (
                    <g key={b.id + s.name}>
                      <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={b.route.color} strokeWidth="3" />
                      {selectedId === b.id && (
                        <text x={p.x + 10} y={p.y - 8} fontSize="12" fontWeight="600" fill="#334155" stroke="#fff" strokeWidth="3" paintOrder="stroke">
                          {s.name}
                        </text>
                      )}
                    </g>
                  );
                })
              )}

              {/* School */}
              <g transform={`translate(${SCHOOL.x},${SCHOOL.y})`}>
                <circle r="26" fill="#4f46e5" opacity="0.15" />
                <rect x="-16" y="-14" width="32" height="28" rx="4" fill="#4f46e5" />
                <polygon points="-20,-14 0,-28 20,-14" fill="#3730a3" />
                <rect x="-4" y="2" width="8" height="12" fill="#fff" />
                <text y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3730a3" stroke="#fff" strokeWidth="3" paintOrder="stroke">
                  EduSphere School
                </text>
              </g>

              {buses.map((b) => (
                <g
                  key={b.id}
                  className="bus-move cursor-pointer"
                  style={{ transform: `translate(${b.pos.x}px, ${b.pos.y}px)` }}
                  onClick={() => setSelectedId(b.id)}
                >
                  {b.status === "Heavy traffic" && <circle r="12" fill="#ef4444" className="pulse-ring" />}
                  <circle r={selectedId === b.id ? 15 : 12} fill={b.route.color} stroke="#fff" strokeWidth="3" />
                  <text textAnchor="middle" y="4" fontSize="11" fontWeight="800" fill="#fff">
                    {b.id.slice(-1)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            {buses.map((b) => (
              <span key={b.id} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: b.route.color }} /> {b.id} · {b.route.name}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded bg-red-500" /> Traffic
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {buses.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition ${
                  selectedId === b.id ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <Bus size={14} className="mr-1 inline" style={{ color: selectedId === b.id ? "#fff" : b.route.color }} /> {b.id}
              </button>
            ))}
          </div>

          <Card title={`${sel.id} · ${sel.route.name}`} subtitle={`Driver ${sel.route.driver} · ${sel.route.plate}`} action={<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(sel.status)}`}>{sel.status}</span>}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Gauge size={13} /> Speed
                </p>
                <p className="text-xl font-bold">{Math.round(sel.speed)} km/h</p>
              </div>
              <div className={`rounded-xl p-3 ${sel.delay > 2 ? "bg-rose-50" : "bg-slate-50"}`}>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <AlertTriangle size={13} /> Traffic delay
                </p>
                <p className="text-xl font-bold">{sel.delay.toFixed(1)} min</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={13} /> ETA to school
                </p>
                <p className="text-xl font-bold">{Math.max(0, Math.round(sel.etaMin))} min</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={13} /> Onboard
                </p>
                <p className="text-xl font-bold">
                  {sel.onboard}/{sel.route.capacity}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Route progress</span>
                <span>
                  {Math.round(sel.frac * 100)}% · {sel.remainingKm.toFixed(1)} km left
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sel.frac * 100}%`, background: sel.route.color }} />
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" /> Last stop: <b>{sel.lastStop}</b>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-500" /> Next: <b>{sel.nextStop}</b>
                {sel.status !== "Arrived" && <span className="text-slate-500">in {Math.max(0, Math.round(sel.nextStopEta))} min</span>}
              </li>
            </ul>

            <div className="mt-4 flex gap-2">
              <button className={`${btnGhost} flex-1 !px-3 !py-2 text-rose-700`} onClick={() => triggerJam(sel.id)} disabled={sel.status === "Arrived"}>
                <AlertTriangle size={14} /> Simulate jam
              </button>
              <button className={`${btnGhost} flex-1 !px-3 !py-2`} onClick={() => clearJam(sel.id)}>
                Clear
              </button>
            </div>
          </Card>

          <Card title={`Students on ${sel.id}`} subtitle={`${riders.length} assigned`}>
            <ul className="scroll-thin max-h-40 space-y-1.5 overflow-y-auto text-sm">
              {riders.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span className="text-slate-800">{s.name}</span>
                  <span className="text-slate-500">{s.cls}</span>
                </li>
              ))}
              {!riders.length && <li className="text-slate-500">No students assigned.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

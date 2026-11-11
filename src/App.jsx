import { useCallback, useState } from "react";
import { Bot, Bus, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, RotateCcw, ScanLine, UserSquare2, Users, X } from "lucide-react";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Students from "./components/Students.jsx";
import Staff from "./components/Staff.jsx";
import OCR from "./components/OCR.jsx";
import BusTracker from "./components/BusTracker.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Reports from "./components/Reports.jsx";
import { Toasts } from "./components/ui.jsx";
import useBusSim from "./hooks/useBusSim.js";
import { SEED_STAFF, SEED_STUDENTS } from "./data/seed.js";
import { KEYS, remove, useLocalStorage } from "./lib/storage.js";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "ocr", label: "OCR Scanner", icon: ScanLine },
  { id: "bus", label: "Bus Tracking", icon: Bus },
  { id: "chat", label: "AI Assistant", icon: Bot },
  { id: "reports", label: "Reports", icon: FileText },
];

function Shell({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [students, setStudents] = useLocalStorage(KEYS.students, SEED_STUDENTS);
  const [staff, setStaff] = useLocalStorage(KEYS.staff, SEED_STAFF);
  const [ocrHistory, setOcrHistory] = useLocalStorage(KEYS.ocr, []);
  const [toasts, setToasts] = useState([]);
  const sim = useBusSim();

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const go = (id) => {
    setPage(id);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const resetData = () => {
    if (window.confirm("Reset all students, staff, chat and scan history to the demo data?")) {
      setStudents(SEED_STUDENTS);
      setStaff(SEED_STAFF);
      setOcrHistory([]);
      remove(KEYS.chat);
      sim.reset();
      notify("Demo data restored");
      setPage("dashboard");
    }
  };

  const current = NAV.find((n) => n.id === page);

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <GraduationCap size={22} />
        </div>
        <div>
          <p className="font-bold leading-tight text-white">EduSphere AI</p>
          <p className="text-[11px] text-slate-400">School automation</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              page === n.id ? "bg-indigo-600 text-white shadow" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <n.icon size={18} /> {n.label}
          </button>
        ))}
      </nav>
      <div className="space-y-2 border-t border-slate-800 p-3">
        <button onClick={resetData} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-800 hover:text-white">
          <RotateCcw size={16} /> Reset demo data
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-slate-400">{user.role}</p>
          </div>
          <button onClick={onLogout} title="Log out" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="flex items-center gap-2 font-semibold text-slate-800">
              {current && <current.icon size={18} className="text-indigo-600" />} {current && current.label}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden items-center gap-1.5 sm:flex">
              <UserSquare2 size={16} /> {user.email}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {page === "dashboard" && <Dashboard user={user} students={students} staff={staff} buses={sim.buses} ocrHistory={ocrHistory} go={go} />}
          {page === "students" && <Students students={students} setStudents={setStudents} notify={notify} />}
          {page === "staff" && <Staff staff={staff} setStaff={setStaff} notify={notify} />}
          {page === "ocr" && <OCR students={students} setStudents={setStudents} ocrHistory={ocrHistory} setOcrHistory={setOcrHistory} notify={notify} />}
          {page === "bus" && <BusTracker sim={sim} students={students} />}
          {page === "chat" && <Chatbot students={students} staff={staff} buses={sim.buses} />}
          {page === "reports" && <Reports students={students} staff={staff} buses={sim.buses} notify={notify} />}
        </main>
      </div>

      <Toasts items={toasts} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useLocalStorage(KEYS.session, null);
  if (!session) return <Auth onAuth={setSession} />;
  return <Shell user={session} onLogout={() => setSession(null)} />;
}

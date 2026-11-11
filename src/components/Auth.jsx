import { useState } from "react";
import { Bot, Bus, FileText, GraduationCap, ScanLine, ShieldCheck } from "lucide-react";
import { DEMO_ACCOUNT, login, signup } from "../lib/auth.js";
import { btnPrimary, inputCls, Label } from "./ui.jsx";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Administrator" });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const res = mode === "login" ? login(form.email, form.password) : signup(form);
    if (!res.ok) return setError(res.error);
    onAuth(res.session);
  };

  const useDemo = () => {
    const res = login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    if (res.ok) onAuth(res.session);
  };

  const features = [
    [ScanLine, "OCR document scanning"],
    [Bus, "Live bus tracking"],
    [Bot, "AI assistant for grades & GPA"],
    [FileText, "One-click PDF reports"],
  ];

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap size={26} />
          </div>
          <span className="text-2xl font-bold">EduSphere AI</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">
            Run your school <br /> smarter, not harder.
          </h1>
          <p className="mt-4 max-w-md text-indigo-100">
            One dashboard for student records, document automation, transport tracking and an AI assistant that answers in seconds.
          </p>
          <ul className="mt-8 grid max-w-md grid-cols-2 gap-3">
            {features.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm">
                <Icon size={18} /> {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-indigo-100">
          <ShieldCheck size={16} /> Data is stored locally in your browser.
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="fade-up w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <GraduationCap className="text-indigo-600" />
            <span className="text-xl font-bold">EduSphere AI</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login" ? "Sign in to open your school dashboard." : "Sign up to start managing your school."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`rounded-lg py-2 transition ${mode === m ? "bg-white text-indigo-700 shadow" : "text-slate-500"}`}
              >
                {m === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <input id="name" className={inputCls} value={form.name} onChange={set("name")} placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <input id="email" type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@school.edu" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <input id="password" type="password" className={inputCls} value={form.password} onChange={set("password")} placeholder="At least 6 characters" />
            </div>
            {mode === "signup" && (
              <div>
                <Label htmlFor="role">Role</Label>
                <select id="role" className={inputCls} value={form.role} onChange={set("role")}>
                  <option>Administrator</option>
                  <option>Teacher</option>
                  <option>Transport Manager</option>
                  <option>Registrar</option>
                </select>
              </div>
            )}
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button type="submit" className={`${btnPrimary} w-full`}>
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-4 text-sm">
            <p className="font-semibold text-indigo-800">Try the demo</p>
            <p className="mt-0.5 text-indigo-700">
              {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
            </p>
            <button type="button" onClick={useDemo} className="mt-2 font-semibold text-indigo-700 underline">
              Sign in as demo admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

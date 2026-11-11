import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ClipboardCopy, FileImage, FileText, ScanLine, Sparkles, UploadCloud, UserPlus } from "lucide-react";
import { SUBJECTS } from "../data/seed.js";
import { nextStudentId } from "../lib/academic.js";
import { btnGhost, btnPrimary, Card, inputCls } from "./ui.jsx";

const DOC_TYPES = ["Student ID Card", "Admission Form", "Report Card"];

const IDENTITIES = [
  { name: "Rahul Desai", dob: "2009-04-17", gender: "Male", cls: "10-B", guardian: "Mahesh Desai", phone: "+91 98765 43210", email: "rahul.desai@gmail.com", address: "14 Lake View Road, Pune 411001", blood: "B+", prev: "St. Mary's High School", marks: [86, 79, 83, 88, 92, 75] },
  { name: "Tanvi Kulkarni", dob: "2010-09-03", gender: "Female", cls: "9-A", guardian: "Sunil Kulkarni", phone: "+91 98220 77881", email: "tanvi.k@gmail.com", address: "22 Rose Garden Lane, Pune 411014", blood: "O+", prev: "Little Flower School", marks: [92, 90, 87, 94, 89, 91] },
  { name: "Yash Bhatt", dob: "2009-12-28", gender: "Male", cls: "10-A", guardian: "Nitin Bhatt", phone: "+91 97650 12345", email: "yash.bhatt@gmail.com", address: "7 Sunrise Apartments, Pune 411028", blood: "A+", prev: "Delhi Public School", marks: [68, 72, 65, 74, 81, 70] },
  { name: "Zoya Ansari", dob: "2011-02-14", gender: "Female", cls: "8-A", guardian: "Farooq Ansari", phone: "+91 99230 55667", email: "zoya.ansari@gmail.com", address: "51 Park Street, Pune 411005", blood: "AB+", prev: "Podar International", marks: [84, 88, 80, 91, 86, 83] },
];

function hashStr(s) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildFields(type, p, seed) {
  const conf = (i) => 90 + ((seed + i * 7) % 10);
  const idNo = "EDU-" + String(2024000 + (seed % 900)).padStart(7, "0");
  let list;
  if (type === "Student ID Card") {
    list = [
      ["name", "Student name", p.name],
      ["idNo", "ID number", idNo],
      ["cls", "Class", p.cls],
      ["dob", "Date of birth", p.dob],
      ["blood", "Blood group", p.blood],
      ["phone", "Emergency contact", p.phone],
      ["valid", "Valid until", "2026-03-31"],
    ];
  } else if (type === "Admission Form") {
    list = [
      ["name", "Student name", p.name],
      ["dob", "Date of birth", p.dob],
      ["gender", "Gender", p.gender],
      ["cls", "Class applied for", p.cls],
      ["guardian", "Parent / guardian", p.guardian],
      ["phone", "Phone", p.phone],
      ["email", "Email", p.email],
      ["address", "Address", p.address],
      ["prev", "Previous school", p.prev],
    ];
  } else {
    list = [
      ["name", "Student name", p.name],
      ["idNo", "ID number", idNo],
      ["cls", "Class", p.cls],
      ["term", "Term", "Term 1 - 2025"],
      ...SUBJECTS.map((s, i) => ["mark:" + s.name, s.name, String(p.marks[i])]),
    ];
  }
  return list.map(([key, label, value], i) => ({ key, label, value, conf: conf(i) }));
}

function SampleDoc({ type, p }) {
  if (type === "Student ID Card") {
    return (
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border-2 border-indigo-300 bg-white text-slate-800 shadow">
        <div className="bg-indigo-600 px-4 py-2 text-center text-sm font-bold text-white">EDUSPHERE INTERNATIONAL SCHOOL</div>
        <div className="flex gap-4 p-4">
          <div className="flex h-24 w-20 items-center justify-center rounded bg-slate-200 text-3xl font-bold text-slate-500">{p.name[0]}</div>
          <div className="space-y-0.5 text-xs">
            <p className="text-base font-bold">{p.name}</p>
            <p>ID: EDU-2024xxx</p>
            <p>Class: {p.cls}</p>
            <p>DOB: {p.dob}</p>
            <p>Blood group: {p.blood}</p>
            <p>Emergency: {p.phone}</p>
            <p>Valid until: 2026-03-31</p>
          </div>
        </div>
      </div>
    );
  }
  if (type === "Admission Form") {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-slate-300 bg-white p-5 text-xs text-slate-800 shadow">
        <p className="text-center text-sm font-bold uppercase tracking-wide">Admission Application Form</p>
        <hr className="my-2" />
        {[
          ["Student name", p.name],
          ["Date of birth", p.dob],
          ["Gender", p.gender],
          ["Class applied for", p.cls],
          ["Parent / guardian", p.guardian],
          ["Phone", p.phone],
          ["Email", p.email],
          ["Address", p.address],
          ["Previous school", p.prev],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-dotted border-slate-300 py-1">
            <span className="text-slate-500">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
        <p className="mt-3 italic text-slate-400">Signature: ______________</p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-300 bg-white p-5 text-xs text-slate-800 shadow">
      <p className="text-center text-sm font-bold uppercase tracking-wide">Report Card - Term 1</p>
      <p className="mt-2">
        <b>{p.name}</b> · Class {p.cls}
      </p>
      <table className="mt-3 w-full">
        <tbody>
          {SUBJECTS.map((s, i) => (
            <tr key={s.name} className="border-b border-dotted border-slate-300">
              <td className="py-1 text-slate-500">{s.name}</td>
              <td className="py-1 text-right font-medium">{p.marks[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STAGES = ["Preprocessing image…", "Detecting text regions…", "Recognising characters…", "Parsing fields…", "Validating results…"];

export default function OCR({ students, setStudents, ocrHistory, setOcrHistory, notify }) {
  const [type, setType] = useState(DOC_TYPES[0]);
  const [source, setSource] = useState(null); // {name, url, isImage, sample, seed}
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fields, setFields] = useState(null);
  const [ident, setIdent] = useState(null);
  const timer = useRef(null);
  const fileRef = useRef(null);

  useEffect(
    () => () => {
      clearInterval(timer.current);
    },
    []
  );

  // free object URLs
  useEffect(
    () => () => {
      if (source && source.url) URL.revokeObjectURL(source.url);
    },
    [source]
  );

  const onFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    setSource({ name: file.name, url: isImage ? URL.createObjectURL(file) : null, isImage, sample: false, seed: hashStr(file.name + file.size) });
    setFields(null);
    setProgress(0);
  };

  const useSample = () => {
    setSource({ name: `sample_${type.toLowerCase().replace(/\s+/g, "_")}.png`, url: null, isImage: false, sample: true, seed: 0 });
    setFields(null);
    setProgress(0);
  };

  const scan = () => {
    if (!source || scanning) return;
    setScanning(true);
    setFields(null);
    setProgress(0);
    let p = 0;
    timer.current = setInterval(() => {
      p += 4 + Math.random() * 5;
      if (p >= 100) {
        clearInterval(timer.current);
        p = 100;
        const person = IDENTITIES[source.seed % IDENTITIES.length];
        const result = buildFields(type, person, source.seed);
        setIdent(person);
        setFields(result);
        setScanning(false);
        setOcrHistory((h) => [
          { id: Date.now(), file: source.name, student: person.name, type, at: new Date().toISOString() },
          ...h,
        ].slice(0, 20));
        notify("Extraction complete");
      }
      setProgress(Math.min(100, p));
    }, 130);
  };

  const editField = (key, value) => setFields((fs) => fs.map((f) => (f.key === key ? { ...f, value } : f)));

  const get = (key) => (fields.find((f) => f.key === key) || {}).value;

  const addStudent = () => {
    const name = (get("name") || "").trim();
    if (!name) return notify("Name field is empty", "error");
    if (students.some((s) => s.name.toLowerCase() === name.toLowerCase())) return notify(`${name} already exists in student records`, "error");
    const grades = {};
    fields.forEach((f) => {
      if (f.key.startsWith("mark:") && f.value !== "" && !Number.isNaN(Number(f.value))) grades[f.key.slice(5)] = Number(f.value);
    });
    setStudents((prev) => [
      ...prev,
      {
        id: nextStudentId(prev),
        name,
        cls: get("cls") || "Unassigned",
        gender: get("gender") || (ident && ident.gender) || "Other",
        dob: get("dob") || "",
        email: get("email") || name.toLowerCase().replace(/[^a-z]+/g, ".") + "@edusphere.school",
        guardian: get("guardian") || (ident && ident.guardian) || "",
        phone: get("phone") || (ident && ident.phone) || "",
        bus: "",
        attendance: 100,
        grades,
      },
    ]);
    notify(`${name} added to student records`);
  };

  const copyJson = async () => {
    const data = Object.fromEntries(fields.map((f) => [f.label, f.value]));
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      notify("Copied extracted data as JSON");
    } catch {
      notify("Clipboard unavailable in this browser", "error");
    }
  };

  const demoPerson = IDENTITIES[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">OCR document scanner</h2>
        <p className="text-sm text-slate-500">
          Simulated OCR: upload a document or use a sample, and the system extracts structured student data. No real text recognition is performed — results are generated for demonstration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="1. Choose a document" subtitle="Upload an image / PDF or try a built-in sample">
          <div className="mb-4 flex flex-wrap gap-2">
            {DOC_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setFields(null);
                  if (source && source.sample) setSource({ ...source, name: `sample_${t.toLowerCase().replace(/\s+/g, "_")}.png` });
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${type === t ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            <UploadCloud className="text-indigo-500" />
            <p className="text-sm font-semibold text-slate-700">Click or drag a file here</p>
            <p className="text-xs text-slate-500">PNG, JPG or PDF</p>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
          </div>
          <button onClick={useSample} className={`${btnGhost} mt-3 w-full`}>
            <Sparkles size={16} /> Use a sample {type.toLowerCase()}
          </button>

          {source && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                {source.isImage ? <FileImage size={16} /> : <FileText size={16} />} {source.name}
              </p>
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4">
                {source.sample ? (
                  <SampleDoc type={type} p={demoPerson} />
                ) : source.isImage ? (
                  <img src={source.url} alt="Uploaded document preview" className="mx-auto max-h-72 rounded object-contain" />
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center text-slate-500">
                    <FileText size={40} />
                    <p className="mt-2 text-sm">PDF document ready to scan</p>
                  </div>
                )}
                {scanning && (
                  <>
                    <div className="absolute inset-0 bg-cyan-400/10" />
                    <div className="scan-line" />
                  </>
                )}
              </div>
              <button onClick={scan} disabled={scanning} className={`${btnPrimary} mt-4 w-full`}>
                <ScanLine size={16} /> {scanning ? "Scanning…" : "Extract data"}
              </button>
              {(scanning || progress > 0) && (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {progress >= 100 ? "Done" : STAGES[Math.min(STAGES.length - 1, Math.floor(progress / 20))]} {Math.round(progress)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="2. Extracted data" subtitle="Review and correct values before saving">
          {fields ? (
            <div className="fade-up space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={16} /> {fields.length} fields extracted · avg confidence{" "}
                {Math.round(fields.reduce((a, f) => a + f.conf, 0) / fields.length)}%
              </div>
              {fields.map((f) => (
                <div key={f.key} className="grid grid-cols-5 items-center gap-3">
                  <label htmlFor={"ocr-" + f.key} className="col-span-2 text-sm text-slate-600">
                    {f.label}
                  </label>
                  <input id={"ocr-" + f.key} className={`${inputCls} col-span-2 py-1.5`} value={f.value} onChange={(e) => editField(f.key, e.target.value)} />
                  <span className={`text-right text-xs font-semibold ${f.conf >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{f.conf}%</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-3">
                <button className={btnPrimary} onClick={addStudent}>
                  <UserPlus size={16} /> Add to student records
                </button>
                <button className={btnGhost} onClick={copyJson}>
                  <ClipboardCopy size={16} /> Copy JSON
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <ScanLine size={40} />
              <p className="mt-2 text-sm">Extracted fields will appear here after scanning.</p>
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Scan history"
        subtitle="Saved in your browser"
        action={
          ocrHistory.length > 0 && (
            <button className="text-xs font-semibold text-rose-600 hover:underline" onClick={() => setOcrHistory([])}>
              Clear
            </button>
          )
        }
      >
        {ocrHistory.length ? (
          <ul className="divide-y divide-slate-100">
            {ocrHistory.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="font-medium text-slate-800">{h.file}</span>
                <span className="text-slate-600">
                  {h.student} · {h.type}
                </span>
                <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No scans yet.</p>
        )}
      </Card>
    </div>
  );
}

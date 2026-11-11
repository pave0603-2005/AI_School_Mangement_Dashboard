import { SUBJECTS } from "../data/seed.js";

const SCALE = [
  [93, 4.0, "A"],
  [90, 3.7, "A-"],
  [87, 3.3, "B+"],
  [83, 3.0, "B"],
  [80, 2.7, "B-"],
  [77, 2.3, "C+"],
  [73, 2.0, "C"],
  [70, 1.7, "C-"],
  [67, 1.3, "D+"],
  [60, 1.0, "D"],
];

export function scoreToPoints(score) {
  const n = Number(score);
  for (const [min, pts] of SCALE) if (n >= min) return pts;
  return 0;
}

export function scoreToLetter(score) {
  const n = Number(score);
  for (const [min, , letter] of SCALE) if (n >= min) return letter;
  return "F";
}

export function creditsFor(subject) {
  const s = SUBJECTS.find((x) => x.name === subject);
  return s ? s.credits : 3;
}

/** Credit-weighted GPA on a 4.0 scale. Returns null when there are no grades. */
export function computeGPA(grades) {
  const entries = Object.entries(grades || {}).filter(([, v]) => v !== "" && v !== null && !Number.isNaN(Number(v)));
  if (!entries.length) return null;
  let pts = 0;
  let cr = 0;
  for (const [sub, score] of entries) {
    const c = creditsFor(sub);
    pts += scoreToPoints(score) * c;
    cr += c;
  }
  return cr ? pts / cr : null;
}

/** Simple (unweighted) GPA from a plain list of percentage scores. */
export function gpaFromScores(scores) {
  if (!scores.length) return null;
  return scores.reduce((a, s) => a + scoreToPoints(s), 0) / scores.length;
}

export function average(grades) {
  const vals = Object.values(grades || {}).map(Number).filter((n) => !Number.isNaN(n));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function fmtGPA(g) {
  return g === null || g === undefined ? "N/A" : g.toFixed(2);
}

export function gpaTone(g) {
  if (g === null || g === undefined) return "bg-slate-100 text-slate-600";
  if (g >= 3.5) return "bg-emerald-100 text-emerald-700";
  if (g >= 2.5) return "bg-sky-100 text-sky-700";
  if (g >= 1.7) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export function nextStudentId(students) {
  const nums = students.map((s) => parseInt(String(s.id).replace(/\D/g, ""), 10)).filter((n) => !Number.isNaN(n));
  return "S" + ((nums.length ? Math.max(...nums) : 1000) + 1);
}

import { SUBJECTS } from "../data/seed.js";
import { average, computeGPA, fmtGPA, gpaFromScores, scoreToLetter, scoreToPoints } from "./academic.js";

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set([
  "who", "is", "the", "of", "find", "show", "me", "get", "staff", "teacher", "teachers", "faculty", "contact",
  "email", "phone", "number", "info", "information", "details", "about", "for", "a", "an", "and", "in", "to",
  "what", "whats", "tell", "give", "my", "please", "can", "you", "do", "does", "are", "our", "school", "where",
  "office", "hours", "room", "department", "dept", "head", "sir", "madam", "mr", "mrs", "ms", "dr", "member",
  "members", "list", "all", "which", "teaches", "teach", "take", "how",
]);

const SYNONYMS = { cs: "computer", maths: "math", bus: "transport", driver: "transport", it: "computer", eng: "english", phy: "physics", chem: "chemistry" };

function findStudents(q, students) {
  const nq = " " + norm(q) + " ";
  const idm = q.match(/s\s?-?(\d{4})/i);
  if (idm) {
    const s = students.find((x) => x.id.toLowerCase() === "s" + idm[1]);
    if (s) return [s];
  }
  const full = students.filter((s) => nq.includes(" " + norm(s.name) + " "));
  if (full.length) return full;
  return students.filter((s) => norm(s.name).split(" ").some((t) => t.length > 2 && nq.includes(" " + t + " ")));
}

function findStaff(q, staff) {
  const tokens = norm(q)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => SYNONYMS[t] || t);
  if (!tokens.length) return [];
  const scored = staff
    .map((m) => {
      const hay = norm(`${m.name} ${m.role} ${m.department}`);
      return { m, score: tokens.filter((t) => t.length > 2 && hay.includes(t)).length };
    })
    .filter((x) => x.score > 0);
  if (!scored.length) return [];
  const best = Math.max(...scored.map((x) => x.score));
  return scored.filter((x) => x.score === best).map((x) => x.m);
}

function findSubject(q) {
  const nq = norm(q);
  return SUBJECTS.find((s) => {
    const n = s.name.toLowerCase();
    return nq.includes(n) || nq.includes(n.slice(0, 4)) || (n === "computer science" && /\bcs\b|computer/.test(nq));
  });
}

function gradeTable(student) {
  const rows = SUBJECTS.filter((s) => student.grades[s.name] !== undefined && student.grades[s.name] !== "").map((s) => [
    s.name,
    String(student.grades[s.name]),
    scoreToLetter(student.grades[s.name]),
    scoreToPoints(student.grades[s.name]).toFixed(1),
  ]);
  return { head: ["Subject", "Score", "Grade", "Points"], rows };
}

function staffCard(m) {
  return `${m.name} - ${m.role}, ${m.department}\nEmail: ${m.email}\nPhone: ${m.phone}\nLocation: ${m.room}\nOffice hours: ${m.hours}`;
}

function busLine(b) {
  return `${b.id} (${b.route.name}) - ${b.status}, ${Math.round(b.speed)} km/h, delay ${b.delay.toFixed(1)} min, next stop ${b.nextStop}, ETA to school ${Math.max(0, Math.round(b.etaMin))} min`;
}

export const SUGGESTIONS = [
  "What are Aarav Sharma's grades?",
  "Calculate GPA for Priya Nair",
  "Calculate GPA for 92, 85, 78, 88",
  "Who is the Physics teacher?",
  "Top 3 students",
  "Where is BUS-2?",
  "Students with low attendance",
];

export function answer(query, { students, staff, buses }) {
  const q = query.trim();
  const nq = norm(q);
  if (!q) return { text: "Please type a question." };

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(nq)) {
    return { text: "Hello! I'm EduBot. Ask me about student grades, GPA, attendance, staff contacts or school buses." };
  }
  if (/\b(thanks|thank you)\b/.test(nq)) return { text: "You're welcome! Anything else I can look up?" };
  if (/\b(help|what can you do|commands)\b/.test(nq)) {
    return {
      text:
        "I can help with:\n- Grades: \"grades of Aarav Sharma\", \"physics marks of Sara Khan\"\n- GPA: \"GPA of Priya Nair\" or \"calculate GPA for 90, 85, 77\"\n- Rankings: \"top 5 students\", \"who is at risk\"\n- Attendance: \"attendance of Kabir Singh\"\n- Staff: \"who is the maths teacher\", \"contact principal\"\n- Buses: \"where is BUS-1\", \"bus delays\"",
    };
  }

  const matched = findStudents(q, students);
  const student = matched.length === 1 ? matched[0] : null;
  const wantsGPA = /\bgpa\b|grade point|cgpa/.test(nq);

  // GPA from raw numbers: "calculate GPA for 90 85 78"
  const stripped = q.replace(/s\s?-?\d{4}/gi, " ");
  const nums = (stripped.match(/\d+(\.\d+)?/g) || []).map(Number).filter((n) => n >= 0 && n <= 100);
  if (wantsGPA && !matched.length && nums.length >= 1) {
    const g = gpaFromScores(nums);
    const rows = nums.map((n) => [String(n), scoreToLetter(n), scoreToPoints(n).toFixed(1)]);
    return {
      text: `Calculated GPA from ${nums.length} score${nums.length > 1 ? "s" : ""} (4.0 scale, equal weights): ${fmtGPA(g)}`,
      table: { head: ["Score", "Grade", "Points"], rows },
    };
  }

  if (matched.length > 1 && !/\b(top|best|highest)\b/.test(nq)) {
    return {
      text: `I found ${matched.length} matching students. Which one do you mean?\n` + matched.map((s) => `- ${s.name} (${s.id}, ${s.cls})`).join("\n"),
    };
  }

  if (student && wantsGPA) {
    const g = computeGPA(student.grades);
    if (g === null) return { text: `${student.name} has no grades recorded yet.` };
    return {
      text: `${student.name}'s credit-weighted GPA is ${fmtGPA(g)} / 4.00 (average score ${average(student.grades).toFixed(1)}%).`,
      table: gradeTable(student),
    };
  }

  if (student && /\bbus\b|transport|route/.test(nq)) {
    const b = buses.find((x) => x.id === student.bus);
    return { text: b ? `${student.name} travels on ${busLine(b)}.` : `${student.name} has no bus assigned.` };
  }

  if (student && /attendance|present|absent/.test(nq)) {
    return { text: `${student.name}'s attendance is ${student.attendance}%${student.attendance < 80 ? " - below the 80% requirement." : "."}` };
  }

  if (student && /grade|mark|score|result|report|subject|physics|math|chem|english|computer|history/.test(nq)) {
    const sub = findSubject(q);
    if (sub && student.grades[sub.name] !== undefined) {
      const sc = student.grades[sub.name];
      return { text: `${student.name} scored ${sc}% in ${sub.name} (grade ${scoreToLetter(sc)}).` };
    }
    if (!Object.keys(student.grades).length) return { text: `${student.name} has no grades recorded yet.` };
    return {
      text: `Grades for ${student.name} (${student.id}, class ${student.cls}). GPA: ${fmtGPA(computeGPA(student.grades))}`,
      table: gradeTable(student),
    };
  }

  // rankings
  const topMatch = nq.match(/\b(?:top|best)\s*(\d+)?/);
  if (topMatch || /highest|topper|rank|leaderboard/.test(nq)) {
    const n = Math.min(10, parseInt(topMatch && topMatch[1], 10) || 3);
    const cls = (q.match(/\b(\d{1,2}\s?-?\s?[a-c])\b/i) || [])[1];
    let pool = students;
    if (cls) {
      const c = cls.replace(/\s/g, "").toUpperCase();
      pool = students.filter((s) => s.cls.replace("-", "") === c.replace("-", ""));
    }
    const ranked = pool
      .map((s) => ({ s, g: computeGPA(s.grades) }))
      .filter((x) => x.g !== null)
      .sort((a, b) => b.g - a.g)
      .slice(0, n);
    if (!ranked.length) return { text: "No ranked students found." };
    return {
      text: `Top ${ranked.length} student${ranked.length > 1 ? "s" : ""} by GPA${cls ? " in class " + cls.toUpperCase() : ""}:`,
      table: { head: ["#", "Student", "Class", "GPA"], rows: ranked.map((x, i) => [String(i + 1), x.s.name, x.s.cls, fmtGPA(x.g)]) },
    };
  }

  if (/low attendance|attendance (below|under)|poor attendance|absentee/.test(nq) || (/attendance/.test(nq) && !student)) {
    const low = students.filter((s) => s.attendance < 85).sort((a, b) => a.attendance - b.attendance);
    const avg = students.reduce((a, s) => a + s.attendance, 0) / (students.length || 1);
    if (!low.length) return { text: `Average attendance is ${avg.toFixed(1)}%. No students are below 85%.` };
    return {
      text: `Average attendance is ${avg.toFixed(1)}%. Students below 85%:`,
      table: { head: ["Student", "Class", "Attendance"], rows: low.map((s) => [s.name, s.cls, s.attendance + "%"]) },
    };
  }

  if (/at risk|failing|struggling|low (gpa|grade|marks)|weak/.test(nq)) {
    const risk = students
      .map((s) => ({ s, g: computeGPA(s.grades) }))
      .filter((x) => x.g !== null && x.g < 2)
      .sort((a, b) => a.g - b.g);
    if (!risk.length) return { text: "Great news - no students currently have a GPA below 2.0." };
    return {
      text: "Students with GPA below 2.0 who may need support:",
      table: { head: ["Student", "Class", "GPA"], rows: risk.map((x) => [x.s.name, x.s.cls, fmtGPA(x.g)]) },
    };
  }

  if (/class average|school average|average gpa|overall/.test(nq)) {
    const gs = students.map((s) => computeGPA(s.grades)).filter((g) => g !== null);
    const avg = gs.reduce((a, b) => a + b, 0) / (gs.length || 1);
    return { text: `The school-wide average GPA is ${avg.toFixed(2)} across ${gs.length} students.` };
  }

  if (/how many students|total students|number of students|student count/.test(nq)) {
    return { text: `There are ${students.length} students enrolled across ${new Set(students.map((s) => s.cls)).size} classes.` };
  }
  if (/how many (staff|teachers)|staff count/.test(nq)) return { text: `There are ${staff.length} staff members on record.` };

  // buses
  if (/\b(bus|buses|transport|route|delay|late|traffic)\b/.test(nq) && !/driver|manager/.test(nq)) {
    const idm = nq.match(/bus\s*(\d)/);
    if (idm) {
      const b = buses.find((x) => x.id === "BUS-" + idm[1]);
      if (b) {
        return {
          text: `${b.id} - ${b.route.name}\nStatus: ${b.status}\nSpeed: ${Math.round(b.speed)} km/h\nDelay: ${b.delay.toFixed(1)} min\nLast stop: ${b.lastStop}\nNext stop: ${b.nextStop} (${Math.max(0, Math.round(b.nextStopEta))} min)\nETA to school: ${Math.max(0, Math.round(b.etaMin))} min\nStudents onboard: ${b.onboard}/${b.route.capacity}`,
        };
      }
      return { text: `I couldn't find BUS-${idm[1]}. Available buses: ${buses.map((x) => x.id).join(", ")}.` };
    }
    if (/delay|late|traffic/.test(nq)) {
      const d = buses.filter((b) => b.status === "Heavy traffic" || b.delay > 1);
      if (!d.length) return { text: "All buses are running on schedule right now." };
      return { text: "Buses affected by delays:\n" + d.map((b) => "- " + busLine(b)).join("\n") };
    }
    return { text: "Live bus status:\n" + buses.map((b) => "- " + busLine(b)).join("\n") };
  }

  // staff
  const staffWords = /staff|teacher|principal|hod|faculty|contact|email|phone|office|registrar|manager|driver|professor|who teaches|who is|department|head/;
  if (staffWords.test(nq) || (!student && !matched.length)) {
    const found = findStaff(q, staff);
    if (found.length && found.length < staff.length) {
      return { text: found.map(staffCard).join("\n\n") };
    }
    if (staffWords.test(nq)) {
      return { text: "Here is the staff directory:\n" + staff.map((m) => `- ${m.name} (${m.role}, ${m.department})`).join("\n") };
    }
  }

  if (student) {
    const g = computeGPA(student.grades);
    return {
      text: `${student.name} (${student.id}) - Class ${student.cls}\nGPA: ${fmtGPA(g)}\nAttendance: ${student.attendance}%\nGuardian: ${student.guardian} (${student.phone})\nBus: ${student.bus || "none"}`,
    };
  }

  return {
    text: "Sorry, I didn't understand that. Try \"grades of Aarav Sharma\", \"calculate GPA for 90, 80, 70\", \"who is the Physics teacher\" or type \"help\".",
  };
}

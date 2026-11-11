import { KEYS, load, save } from "./storage.js";

// NOTE: this is a client-side simulation. Passwords are only lightly hashed
// and kept in localStorage - do not use this approach in production.
function hash(str) {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 31) ^ c;
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

export const DEMO_ACCOUNT = { email: "admin@edusphere.ai", password: "admin123" };

export function ensureDemoUser() {
  const users = load(KEYS.users, []);
  if (!users.some((u) => u.email === DEMO_ACCOUNT.email)) {
    users.push({
      id: "U0",
      name: "Demo Admin",
      email: DEMO_ACCOUNT.email,
      role: "Administrator",
      pass: hash(DEMO_ACCOUNT.password),
      created: new Date().toISOString(),
    });
    save(KEYS.users, users);
  }
}

export function signup({ name, email, password, role }) {
  ensureDemoUser();
  const users = load(KEYS.users, []);
  const mail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Please enter your full name." };
  if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "Please enter a valid email address." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (users.some((u) => u.email === mail)) return { ok: false, error: "An account with this email already exists." };
  const user = {
    id: "U" + Date.now(),
    name: name.trim(),
    email: mail,
    role,
    pass: hash(password),
    created: new Date().toISOString(),
  };
  save(KEYS.users, [...users, user]);
  return { ok: true, session: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export function login(email, password) {
  ensureDemoUser();
  const users = load(KEYS.users, []);
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.pass !== hash(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, session: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

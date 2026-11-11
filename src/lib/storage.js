import { useEffect, useState } from "react";

export const KEYS = {
  users: "edusphere_users",
  session: "edusphere_session",
  students: "edusphere_students",
  staff: "edusphere_staff",
  ocr: "edusphere_ocr_history",
  chat: "edusphere_chat",
};

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable - ignore */
  }
}

export function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));
  useEffect(() => {
    save(key, value);
  }, [key, value]);
  return [value, setValue];
}

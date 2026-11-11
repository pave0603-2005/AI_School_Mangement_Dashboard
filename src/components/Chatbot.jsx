import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, User } from "lucide-react";
import { SUGGESTIONS, answer } from "../lib/chatbot.js";
import { KEYS, load, save } from "../lib/storage.js";
import { Card } from "./ui.jsx";

const WELCOME = {
  id: 0,
  role: "bot",
  text: "Hi, I'm EduBot! Ask me for student grades, GPA calculations, attendance, staff contacts or live bus status.",
};

export default function Chatbot({ students, staff, buses }) {
  const [messages, setMessages] = useState(() => load(KEYS.chat, [WELCOME]));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    save(KEYS.chat, messages.slice(-60));
  }, [messages]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: q }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      let reply;
      try {
        reply = answer(q, { students, staff, buses });
      } catch {
        reply = { text: "Something went wrong while looking that up. Please try rephrasing." };
      }
      setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", ...reply }]);
      setTyping(false);
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI assistant</h2>
          <p className="text-sm text-slate-500">Retrieve grades, calculate GPA and find staff using natural language.</p>
        </div>
        <button
          onClick={() => setMessages([WELCOME])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Trash2 size={15} /> Clear chat
        </button>
      </div>

      <Card className="!p-0">
        <div className="flex h-[60vh] min-h-[380px] flex-col">
          <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-slate-800 text-white" : "bg-indigo-600 text-white"}`}>
                  {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user" ? "rounded-tr-sm bg-slate-800 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.table && (
                    <div className="mt-3 overflow-x-auto rounded-lg bg-white ring-1 ring-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-indigo-50 text-indigo-700">
                          <tr>
                            {m.table.head.map((h) => (
                              <th key={h} className="px-3 py-2 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.table.rows.map((r, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              {r.map((c, j) => (
                                <td key={j} className="px-3 py-1.5 text-slate-700">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Bot size={18} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="scroll-thin mb-3 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. “GPA of Sara Khan” or “Who is the English teacher?”"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}

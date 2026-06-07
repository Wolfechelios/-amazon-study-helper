import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { starExamples, starGuide } from "./starExamples";
import "./styles.css";

type Q = { area: string; prompt: string; answers: string[]; correct: number; note: string; weak: string };

const bank: Q[] = [
  { area: "Server Hardware", prompt: "A server reboots under load. What answer shows the best troubleshooting process?", answers: ["Swap parts immediately", "Check event logs, power, thermal, memory, and recent changes", "Ignore it if it comes back", "Reinstall the OS first"], correct: 1, note: "Say: I gather evidence first, confirm scope, check logs, isolate the failing layer, then document and escalate if needed.", weak: "Hardware fault isolation" },
  { area: "Server Hardware", prompt: "A drive shows growing media errors. What should you do?", answers: ["Trend SMART data, verify slot and serial, follow replacement process, validate after", "Erase it", "Ignore until it fully fails", "Move the cable only"], correct: 0, note: "Mention exact asset, slot, serial, before and after validation, and ticket notes.", weak: "Storage replacement process" },
  { area: "Networking", prompt: "A link is down. What is the best first path?", answers: ["Change IP settings", "Start at physical layer: seating, LED, optic, cable, far end, counters", "Reboot every device", "Close as network team issue"], correct: 1, note: "Interview answer: I start Layer 1, then verify interface state, counters, logs, and escalation path.", weak: "Network layer order" },
  { area: "Networking", prompt: "CRC errors usually point to what?", answers: ["Bad credentials", "Physical signal path: cable, optic, connector, or bend issue", "Full disk", "Wrong hostname"], correct: 1, note: "Call out media path, cleaning, swap testing, and error-counter validation.", weak: "CRC and link counters" },
  { area: "Linux Host", prompt: "How do you check what is eating CPU?", answers: ["top or htop, load average, process list, then vmstat or logs", "Only ping", "Only check rack label", "Only replace power"], correct: 0, note: "Say the command, what you look for, and how you confirm whether it is normal load or a fault.", weak: "CPU triage commands" },
  { area: "Linux Host", prompt: "How do you check heavy disk I/O?", answers: ["iostat and iotop, then check latency and noisy process", "Only check LEDs", "Only DNS lookup", "Only restart app"], correct: 0, note: "Mention latency, utilization, queue depth, and which process or mount is responsible.", weak: "Disk I/O triage" },
  { area: "Cooling", prompt: "Why do blanking panels and clean cable paths matter?", answers: ["They control airflow and reduce hot-air recirculation", "They change server firmware", "They replace monitoring", "They only look nice"], correct: 0, note: "Tie cooling to reliability: intake temperature, airflow path, and hot/cold aisle discipline.", weak: "Cooling and airflow" },
  { area: "Data Center Ops", prompt: "Before completing rack work, what should you verify?", answers: ["U position, rails, asset, labels, A/B power, cable route, boot state", "Only hostname", "Only that it powers once", "Nothing if it fits"], correct: 0, note: "This answer shows quality control and ownership.", weak: "Rack validation" },
  { area: "Safety", prompt: "What should you say if asked about safety culture?", answers: ["Speed matters more than procedure", "I stop, communicate, control the risk, then continue correctly", "I work around unclear instructions", "I avoid reporting near misses"], correct: 1, note: "Strong answer: safety stop is ownership; I would rather pause than create harm or rework.", weak: "Safety interview answer" },
  { area: "Tickets", prompt: "What makes a strong ticket update?", answers: ["Symptom, checks, timestamps, serials, action, validation, next step", "Fixed", "See above", "No notes if solved"], correct: 0, note: "Ticket quality matters in shift handoff and audit trail.", weak: "Ticket documentation" },
  { area: "Change", prompt: "What belongs in a good change plan or MOP?", answers: ["Pre-checks, steps, validation, abort point, rollback, post-checks", "Only a title", "No rollback", "Only the final result"], correct: 0, note: "Use the phrase: controlled work, clear owner, expected result, rollback path.", weak: "Change control" },
  { area: "Behavioral", prompt: "Tell me about a time you made a mistake. Best structure?", answers: ["Blame someone", "STAR: situation, task, action, result, then what you changed", "Say you never make mistakes", "Give no result"], correct: 1, note: "Prepare one honest story with ownership, correction, and prevention.", weak: "Behavioral STAR story" },
  { area: "Behavioral", prompt: "Tell me about dealing with pressure. Best answer focus?", answers: ["Panic but hide it", "Prioritize impact, communicate, follow process, keep quality", "Skip process", "Work silently"], correct: 1, note: "Amazon-style answer: customer impact, urgency, ownership, communication, and metrics.", weak: "Pressure story" },
  { area: "Behavioral", prompt: "Tell me about a time you learned something fast. Best proof?", answers: ["Say you are smart", "Explain the gap, how you learned, how you applied it, and result", "Avoid details", "Say training was not needed"], correct: 1, note: "Use your electrician/engineering background: technical learning under real consequences.", weak: "Learning agility" },
  { area: "Leadership", prompt: "Ownership means what in an interview answer?", answers: ["Only doing assigned tasks", "Taking responsibility for outcome, handoff, documentation, and follow-through", "Waiting for manager", "Ignoring adjacent risk"], correct: 1, note: "Ownership is not ego; it is accountable follow-through.", weak: "Ownership principle" },
  { area: "Leadership", prompt: "Dive Deep means what?", answers: ["Guess quickly", "Use data, inspect details, verify assumptions, find root cause", "Only trust first report", "Avoid logs"], correct: 1, note: "Tie this to logs, counters, serials, measurements, and validation.", weak: "Dive Deep principle" },
  { area: "Communication", prompt: "When escalating, what should you include?", answers: ["Only 'help'", "Impact, timeline, what you checked, evidence, suspected cause, requested action", "No context", "Only screenshots"], correct: 1, note: "Escalation should reduce work for the next owner.", weak: "Escalation clarity" },
  { area: "Customer Impact", prompt: "Why does a data center tech care about process?", answers: ["Process slows things down", "Process protects uptime, safety, repeatability, and customer trust", "Only managers care", "It replaces thinking"], correct: 1, note: "Use uptime and customer impact as the business reason.", weak: "Customer impact framing" },
];

const defaults = "Weak areas to drill:\n- CPU triage: top, htop, load average, vmstat\n- Disk I/O: iostat, iotop, latency, utilization\n- Network links: Layer 1 first, counters, optics, far end\n- STAR stories: mistake, pressure, learning fast, ownership\n- Tickets: symptom, checks, action, validation, next step";
function shuffle<T>(x: T[]) { return [...x].sort(() => Math.random() - 0.5); }

function App() {
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [notes, setNotes] = useState(() => localStorage.getItem("weakNotes") || defaults);
  const [mode, setMode] = useState<"all" | "technical" | "behavioral">("all");

  useEffect(() => localStorage.setItem("weakNotes", notes), [notes]);

  const pool = bank.filter(q => mode === "all" || (mode === "technical" ? !["Behavioral", "Leadership", "Communication", "Customer Impact"].includes(q.area) : ["Behavioral", "Leadership", "Communication", "Customer Impact"].includes(q.area)));
  const deck = useMemo(() => shuffle(pool), [round, mode]);
  const q = deck[i] || deck[0];
  const done = pick !== null;
  const final = done && i === deck.length - 1;

  function answer(n: number) { if (done) return; setPick(n); if (n === q.correct) setScore(s => s + 1); else if (!missed.includes(q.weak)) setMissed(m => [...m, q.weak]); }
  function next() { if (i < deck.length - 1) { setI(i + 1); setPick(null); } }
  function restart(nextMode = mode) { setMode(nextMode); setRound(r => r + 1); setI(0); setPick(null); setScore(0); setMissed([]); }
  function addMissesToNotes() { const add = missed.length ? "\n\nMissed today:\n- " + missed.join("\n- ") : "\n\nNo missed areas yet."; setNotes(n => n + add); }
  function saveStar(text: string) { setNotes(n => n + "\n\nSTAR answer:\n" + text); }

  return <main className="app-shell">
    <section className="hero"><div><p className="eyebrow">Interview Ready Drill</p><h1>AWS Data Center Ops Prep</h1><p>Practice technical answers, STAR wording, process thinking, safety, ownership, and weak-area notes.</p></div><div className="score-card"><span>Score</span><strong>{score}/{deck.length}</strong><small>{mode} mode</small></div></section>
    <section className="star-card"><h2>STAR Answer Builder</h2><p>{starGuide}</p><div className="star-grid">{starExamples.map(ex => <article key={ex.title}><h3>{ex.title}</h3><p>{ex.text}</p><button onClick={() => saveStar(ex.text)}>Save to Notes</button></article>)}</div></section>
    <section className="mode-row"><button onClick={() => restart("all")}>All</button><button onClick={() => restart("technical")}>Technical</button><button onClick={() => restart("behavioral")}>Behavioral</button></section>
    <section className="game-card"><div className="area-row"><span>{q.area}</span><span>Question {i + 1} of {deck.length}</span></div><div className="progress"><div style={{ width: `${((i + Number(done)) / deck.length) * 100}%` }} /></div><h2>{q.prompt}</h2><div className="choices">{q.answers.map((a, n) => { let c = "choice"; if (done && n === q.correct) c += " correct"; if (done && n === pick && n !== q.correct) c += " wrong"; return <button className={c} key={a} onClick={() => answer(n)}><span>{String.fromCharCode(65+n)}</span>{a}</button>; })}</div>{done && <div className="explain"><strong>{pick === q.correct ? "Correct." : "Missed."}</strong> {q.note}<br/><b>Weak tag:</b> {q.weak}</div>}<div className="actions"><button className="ghost" onClick={() => restart()}>Restart</button><button onClick={next} disabled={!done || final}>{final ? "Round complete" : "Next"}</button></div></section>
    <section className="notes-card"><div><h2>Weak-Area Notes</h2><p>Use this before the interview. It saves on this browser.</p></div><textarea value={notes} onChange={e => setNotes(e.target.value)} /><div className="actions"><button className="ghost" onClick={() => setNotes(defaults)}>Reset Notes</button><button onClick={addMissesToNotes}>Add Missed Areas</button></div>{missed.length > 0 && <div className="missed"><strong>Missed this round:</strong> {missed.join(", ")}</div>}</section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<App />);

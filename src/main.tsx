import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Q = { area: string; prompt: string; answers: string[]; correct: number; note: string };

const bank: Q[] = [
  { area: "Server Hardware", prompt: "A host reboots under load. Best first move?", answers: ["Replace random parts", "Read BMC logs, system events, thermal, power, and memory clues", "Ignore logs", "Close the ticket"], correct: 1, note: "Start with evidence before parts. Logs narrow the fault path." },
  { area: "Server Hardware", prompt: "Which memory event is most urgent?", answers: ["One corrected event", "Uncorrected ECC event", "Inventory scan", "Normal DIMM temp"], correct: 1, note: "Uncorrected memory faults can crash a host and need fast action." },
  { area: "Server Hardware", prompt: "Which disk signs suggest replacement?", answers: ["Growing reallocated or pending sectors", "Model name is visible", "Drive has a label", "Drive is online"], correct: 0, note: "SMART growth trends matter more than a single healthy-looking status line." },
  { area: "Networking", prompt: "A 100G link is down. Best order?", answers: ["Reboot first", "Check seating, link state, optic, cable, far end, and logs", "Change IP", "Skip to close"], correct: 1, note: "Layer 1 first, then counters and logs." },
  { area: "Networking", prompt: "CRC errors usually indicate what?", answers: ["Physical signal or media issue", "Bad password", "Full disk", "Wrong ticket title"], correct: 0, note: "CRC means frames are damaged before normal processing." },
  { area: "Networking", prompt: "Useful optic values during link triage?", answers: ["Rx, Tx, temp, bias", "Only hostname", "Only rack row", "Only ticket age"], correct: 0, note: "Optic readings show whether light and module health look normal." },
  { area: "Linux Host", prompt: "How do you check what is eating CPU?", answers: ["top or htop, then load and run queue", "Only ping", "Only swap PSU", "Only read asset tag"], correct: 0, note: "Use process view first, then verify pressure with vmstat or similar tools." },
  { area: "Linux Host", prompt: "How do you check heavy disk I/O?", answers: ["iostat and iotop", "Only interface counters", "Only cable labels", "Only browser cache"], correct: 0, note: "Device latency plus per-process I/O tells the story." },
  { area: "Cooling", prompt: "Why use blanking panels?", answers: ["Reduce hot air recirculation", "Increase CPU speed", "Replace grounding", "Auto-close tickets"], correct: 0, note: "Cooling works when cold intake and hot exhaust stay separated." },
  { area: "Data Center Ops", prompt: "Rack and stack validation includes what?", answers: ["BOM, U position, rails, power feeds, labels, and boot state", "Paint color", "Only one power feed", "Nothing after install"], correct: 0, note: "Good install quality prevents repeat work and wrong-location errors." },
  { area: "Safety", prompt: "When do you stop work?", answers: ["Unsafe lift, unclear procedure, or uncontrolled hazard", "Never", "Only after shift", "Only if ticket is old"], correct: 0, note: "Stop, communicate, correct the condition, then continue." },
  { area: "Safety", prompt: "Best fiber handling rule?", answers: ["Confirm state, cap ends, keep it clean, handle fragments properly", "Leave ends uncapped", "Guess the port", "Skip inspection"], correct: 0, note: "Fiber work needs clean handling and exact port discipline." },
  { area: "Tickets", prompt: "What belongs in a replacement ticket?", answers: ["Symptom, checks, old/new serials, slot, validation, next owner", "Only fixed", "Only screenshot", "Nothing"], correct: 0, note: "Ticket detail protects the next shift and proves the work." },
  { area: "Change", prompt: "A strong MOP includes what?", answers: ["Pre-checks, exact steps, validation, abort rule, rollback, post-checks", "A vague note", "No rollback", "No validation"], correct: 0, note: "A MOP should be executable without guessing." },
  { area: "Process", prompt: "High-severity host-down ticket: first pattern?", answers: ["Acknowledge, follow runbook, gather facts, communicate, escalate, document", "Wait", "Guess parts", "Close as duplicate"], correct: 0, note: "Urgency plus control: communicate while you work the runbook." },
];

function shuffle<T>(x: T[]) { return [...x].sort(() => Math.random() - 0.5); }

function App() {
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const deck = useMemo(() => shuffle(bank), [round]);
  const q = deck[i];
  const done = pick !== null;
  const final = done && i === deck.length - 1;

  function answer(n: number) {
    if (done) return;
    setPick(n);
    if (n === q.correct) setScore(s => s + 1);
  }

  function next() {
    if (i < deck.length - 1) { setI(i + 1); setPick(null); }
  }

  function restart() { setRound(round + 1); setI(0); setPick(null); setScore(0); }

  return <main className="app-shell">
    <section className="hero">
      <div>
        <p className="eyebrow">Technical Mini Game</p>
        <h1>AWS Data Center Ops Drill</h1>
        <p>Multiple-choice practice for server hardware, networking, cooling, safety, tickets, process, change, and host triage.</p>
      </div>
      <div className="score-card"><span>Score</span><strong>{score}/{deck.length}</strong><small>Question {i + 1}</small></div>
    </section>

    <section className="game-card">
      <div className="area-row"><span>{q.area}</span><span>{Math.round(((i + Number(done)) / deck.length) * 100)}%</span></div>
      <div className="progress"><div style={{ width: `${((i + Number(done)) / deck.length) * 100}%` }} /></div>
      <h2>{q.prompt}</h2>
      <div className="choices">
        {q.answers.map((a, n) => {
          let c = "choice";
          if (done && n === q.correct) c += " correct";
          if (done && n === pick && n !== q.correct) c += " wrong";
          return <button className={c} key={a} onClick={() => answer(n)}><span>{String.fromCharCode(65+n)}</span>{a}</button>;
        })}
      </div>
      {done && <div className="explain"><strong>{pick === q.correct ? "Correct." : "Missed."}</strong> {q.note}</div>}
      <div className="actions"><button className="ghost" onClick={restart}>Restart</button><button onClick={next} disabled={!done || final}>{final ? "Round complete" : "Next"}</button></div>
    </section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<App />);

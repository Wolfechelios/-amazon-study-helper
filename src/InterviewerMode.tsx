import React, { useEffect, useMemo, useState } from "react";
import "./interviewer.css";

type InterviewMode = "behavioral" | "technical" | "mixed" | "practice" | "mock";
type RoleTarget = "L3 Engineering Operations Technician" | "L4 Engineering Operations Technician" | "General Amazon Interview" | "Electrical Maintenance Role" | "Data Center Technician Role";

type InterviewQuestion = {
  mode: InterviewMode;
  roleFocus: string[];
  prompt: string;
  followUp: string;
  principles: string[];
  strongSignals: string[];
  betterAnswer: string;
};

type InterviewRecord = {
  at: string;
  mode: InterviewMode;
  role: RoleTarget;
  pressure: boolean;
  question: string;
  answer: string;
  score: number;
  feedback: ReturnType<typeof gradeAnswer>;
  gradeKey?: string;
};

const roles: RoleTarget[] = [
  "L3 Engineering Operations Technician",
  "L4 Engineering Operations Technician",
  "General Amazon Interview",
  "Electrical Maintenance Role",
  "Data Center Technician Role",
];

const modeLabels: Record<InterviewMode, string> = {
  behavioral: "Behavioral Interview",
  technical: "Technical Interview",
  mixed: "Mixed Amazon Loop",
  practice: "Practice Mode",
  mock: "Mock Interview Mode",
};

const questions: InterviewQuestion[] = [
  {
    mode: "behavioral",
    roleFocus: ["L3", "L4", "General"],
    prompt: "Tell me about a time you took ownership of a problem that was not clearly assigned to you.",
    followUp: "What exactly did you do that changed the outcome?",
    principles: ["Ownership", "Bias for Action", "Earn Trust"],
    strongSignals: ["clear personal role", "handoff or documentation", "specific result"],
    betterAnswer: "Use a real maintenance or troubleshooting story. State the problem, your responsibility, the exact steps you took, who you communicated with, and the result in uptime, safety, rework avoided, or time saved.",
  },
  {
    mode: "behavioral",
    roleFocus: ["L3", "L4", "General"],
    prompt: "Tell me about a time you made a mistake at work.",
    followUp: "What did you change afterward so the mistake would not repeat?",
    principles: ["Ownership", "Learn and Be Curious", "Earn Trust"],
    strongSignals: ["no blaming", "corrective action", "prevention step"],
    betterAnswer: "Pick a controlled, honest mistake. Explain the miss, how you corrected it, how you informed the right people, and the checklist, label, pre-check, or verification step you added afterward.",
  },
  {
    mode: "technical",
    roleFocus: ["L3", "L4", "Electrical", "Data Center"],
    prompt: "Walk me through how you would troubleshoot a breaker that keeps tripping on a critical load.",
    followUp: "What readings would you take, and how would those readings prove the fault?",
    principles: ["Dive Deep", "Ownership", "Insist on the Highest Standards"],
    strongSignals: ["safety first", "source-to-load sequence", "meter readings", "load isolation", "validation"],
    betterAnswer: "Start with safety and LOTO if required. Identify the load, trip timing, breaker rating, conductor size, recent changes, and symptoms. Separate overload, short, ground fault, equipment fault, and weak breaker. Validate with voltage, amperage, insulation/continuity checks where appropriate, then document the fix and post-test.",
  },
  {
    mode: "technical",
    roleFocus: ["L3", "L4", "Data Center"],
    prompt: "A server rack has intermittent power alarms. What is your troubleshooting sequence?",
    followUp: "How do you avoid creating a bigger outage while checking it?",
    principles: ["Customer Obsession", "Dive Deep", "Ownership"],
    strongSignals: ["A/B power awareness", "PDU or whip checks", "logs", "change control", "escalation"],
    betterAnswer: "Confirm impact and alarm source, review recent changes, check A/B feeds without disturbing live load, inspect PDU status, breakers, cords, seating, load balance, and environmental factors. Escalate with evidence if facility power or upstream distribution is suspected.",
  },
  {
    mode: "technical",
    roleFocus: ["L4", "Electrical", "Data Center"],
    prompt: "How would you handle a motor or pump that starts sometimes but fails under demand?",
    followUp: "What would tell you the issue is control-side versus load-side?",
    principles: ["Dive Deep", "Bias for Action", "Deliver Results"],
    strongSignals: ["control voltage", "overloads", "contactors", "load conditions", "repeatable test"],
    betterAnswer: "Check incoming voltage, control voltage, command signal, overload state, contactor operation, terminals, motor current under demand, mechanical load, and fault history. Isolate whether the failure follows control logic, power delivery, or the driven equipment.",
  },
  {
    mode: "mixed",
    roleFocus: ["L3", "L4", "General", "Electrical", "Data Center"],
    prompt: "Tell me about a time you had to solve a technical problem under pressure while keeping people safe.",
    followUp: "What was the measurable result, and who did you update during the event?",
    principles: ["Ownership", "Dive Deep", "Bias for Action", "Customer Obsession"],
    strongSignals: ["pressure context", "safety controls", "technical steps", "communication", "measured result"],
    betterAnswer: "Use a real outage, equipment failure, or urgent repair. Keep the answer tight: what was down, what risk existed, what safety step you took first, the exact troubleshooting sequence, who you notified, and the final result.",
  },
  {
    mode: "mixed",
    roleFocus: ["L4", "General", "Data Center"],
    prompt: "Tell me about a time you improved a process or prevented repeat failures.",
    followUp: "How did you prove the improvement worked?",
    principles: ["Invent and Simplify", "Insist on the Highest Standards", "Deliver Results"],
    strongSignals: ["root cause", "standard work", "before and after", "team adoption"],
    betterAnswer: "Describe the recurring problem, the root cause, the change you made to the process, how you trained or documented it, and what improved afterward: fewer call-backs, fewer errors, faster troubleshooting, or safer work.",
  },
];

function loadHistory(): InterviewRecord[] {
  try { return JSON.parse(localStorage.getItem("interviewerHistory") || "[]"); } catch { return []; }
}

function scorePart(answer: string, words: string[]) {
  const lower = answer.toLowerCase();
  return words.some(word => lower.includes(word));
}

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function makeGradeKey(input: { mode: InterviewMode; role: RoleTarget; pressure: boolean; question: string; answer: string }) {
  return JSON.stringify({
    mode: input.mode,
    role: input.role,
    pressure: input.pressure,
    question: input.question,
    answer: normalizeAnswer(input.answer),
  });
}

function getRecordGradeKey(record: InterviewRecord) {
  return record.gradeKey || makeGradeKey(record);
}

function gradeAnswer(answer: string, q: InterviewQuestion, pressure: boolean) {
  const lower = answer.toLowerCase();
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const situation = wordCount > 20 && scorePart(lower, ["when", "while", "job", "site", "project", "equipment", "system", "rack", "motor", "breaker"]);
  const task = scorePart(lower, ["needed", "had to", "responsible", "my job", "task", "goal", "assigned"]);
  const action = scorePart(lower, ["checked", "tested", "measured", "verified", "isolated", "communicated", "documented", "replaced", "inspected"]);
  const result = scorePart(lower, ["result", "fixed", "restored", "reduced", "saved", "prevented", "passed", "completed", "%", "hours", "minutes"]);
  const safety = scorePart(lower, ["safe", "safety", "lockout", "loto", "ppe", "de-energized", "risk"]);
  const metrics = /\d/.test(answer) || scorePart(lower, ["measurable", "downtime", "uptime", "repeat", "callback"]);
  const signalHits = q.strongSignals.filter(signal => scorePart(lower, signal.split(/\s+|-/))).length;
  const raw = [situation, task, action, result, safety || q.mode === "behavioral", metrics, signalHits >= 2].filter(Boolean).length;
  const score = Math.max(1, Math.min(5, Math.round((raw / 7) * 5)));
  const missing = [
    !situation && "clear Situation",
    !task && "specific Task or responsibility",
    !action && "exact Actions taken",
    !result && "measurable Result",
    !(safety || q.mode === "behavioral") && "safety controls / LOTO / risk control",
    !metrics && "numbers, timing, readings, or measurable impact",
  ].filter(Boolean) as string[];
  const pressurePrompt = pressure && score < 4 ? "Can you be more specific? What exactly did you do, what readings did you take, and what was the measurable result?" : "";
  return { situation, task, action, result, safety, metrics, score, missing, pressurePrompt };
}

export function InterviewerMode() {
  const [mode, setMode] = useState<InterviewMode>("mixed");
  const [role, setRole] = useState<RoleTarget>("L3 Engineering Operations Technician");
  const [pressure, setPressure] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [records, setRecords] = useState<InterviewRecord[]>(loadHistory);
  const [activeRecord, setActiveRecord] = useState<InterviewRecord | null>(null);
  const [lastGradeKey, setLastGradeKey] = useState("");

  useEffect(() => localStorage.setItem("interviewerHistory", JSON.stringify(records.slice(-50))), [records]);

  const deck = useMemo(() => {
    const roleKey = role.includes("L3") ? "L3" : role.includes("L4") ? "L4" : role.includes("Electrical") ? "Electrical" : role.includes("Data Center") ? "Data Center" : "General";
    const eligible = questions.filter(q => mode === "mock" || mode === "practice" ? true : q.mode === mode || (mode === "mixed" && ["mixed", "behavioral", "technical"].includes(q.mode)));
    return eligible.filter(q => q.roleFocus.includes(roleKey) || q.roleFocus.includes("General"));
  }, [mode, role]);

  const q = deck[index % Math.max(1, deck.length)] || questions[0];
  const currentGradeKey = answer.trim() ? makeGradeKey({ mode, role, pressure, question: q.prompt, answer }) : "";
  const alreadyGradedCurrentAnswer = Boolean(currentGradeKey && currentGradeKey === lastGradeKey && activeRecord);
  const average = records.length ? Math.round((records.reduce((sum, item) => sum + item.score, 0) / records.length) * 10) / 10 : 0;
  const weakAreas = records.flatMap(item => item.feedback.missing).slice(-8);

  function submitAnswer() {
    if (!answer.trim()) return;

    const gradeKey = makeGradeKey({ mode, role, pressure, question: q.prompt, answer });
    const feedback = gradeAnswer(answer, q, pressure);
    const record: InterviewRecord = { at: new Date().toISOString(), mode, role, pressure, question: q.prompt, answer, score: feedback.score, feedback, gradeKey };

    setActiveRecord(record);
    setLastGradeKey(gradeKey);

    setRecords(prev => {
      const existingIndex = prev.findIndex(item => getRecordGradeKey(item) === gradeKey);
      if (existingIndex === -1) return [...prev.slice(-49), record];

      const updated = [...prev];
      updated[existingIndex] = record;
      return updated.slice(-50);
    });
  }

  function nextQuestion() {
    setAnswer("");
    setActiveRecord(null);
    setLastGradeKey("");
    setIndex(i => i + 1);
  }

  function resetSession() {
    setAnswer("");
    setActiveRecord(null);
    setLastGradeKey("");
    setIndex(0);
  }

  return <section className="interviewer-card" id="interviewer-mode">
    <div className="interviewer-top">
      <div>
        <div className="section-label">Interviewer Mode</div>
        <h2>Amazon-Style Mock Interview</h2>
        <p>Answer one question at a time. The evaluator grades STAR structure, Leadership Principles, safety detail, technical depth, and measurable results.</p>
      </div>
      <div className="interviewer-score"><span>Average</span><strong>{average || "—"}</strong><small>1–5 score</small></div>
    </div>

    <div className="interviewer-controls">
      <label>Interview Type<select value={mode} onChange={e => { setMode(e.target.value as InterviewMode); resetSession(); }}>{Object.entries(modeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Target Role<select value={role} onChange={e => { setRole(e.target.value as RoleTarget); resetSession(); }}>{roles.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="pressure-toggle"><input type="checkbox" checked={pressure} onChange={e => { setPressure(e.target.checked); setActiveRecord(null); setLastGradeKey(""); }} /> Amazon Pressure Mode</label>
    </div>

    <div className="interviewer-question">
      <div className="answer-top"><span>{modeLabels[mode]}</span><b>{role}</b></div>
      <h3>Interviewer: {q.prompt}</h3>
      {pressure && <p className="pressure-line">Pressure mode active: vague answers will get pushed for exact actions, readings, ownership, and result.</p>}
      <textarea value={answer} onChange={e => { setAnswer(e.target.value); if (activeRecord) { setActiveRecord(null); setLastGradeKey(""); } }} placeholder="Type your answer in STAR format: Situation, Task, Action, Result. Include tools, readings, safety steps, communication, and measurable outcome." />
      <div className="actions"><button className="ghost" onClick={resetSession}>Reset Session</button><button onClick={submitAnswer} disabled={alreadyGradedCurrentAnswer}>{alreadyGradedCurrentAnswer ? "Answer Already Graded" : activeRecord ? "Re-grade Answer" : "Grade Answer"}</button></div>
    </div>

    {activeRecord && <div className="interviewer-feedback">
      <h3>Score: {activeRecord.score}/5</h3>
      <div className="feedback-grid">
        <article><b>STAR Breakdown</b><p>Situation: {activeRecord.feedback.situation ? "Clear" : "Missing or vague"}</p><p>Task: {activeRecord.feedback.task ? "Clear" : "Needs responsibility"}</p><p>Action: {activeRecord.feedback.action ? "Specific" : "Needs exact steps"}</p><p>Result: {activeRecord.feedback.result ? "Present" : "Needs measurable outcome"}</p></article>
        <article><b>Leadership Principles matched</b><ul>{q.principles.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article><b>Missing details</b>{activeRecord.feedback.missing.length ? <ul>{activeRecord.feedback.missing.map(item => <li key={item}>{item}</li>)}</ul> : <p>Core interview elements are present. Tighten wording and delivery.</p>}</article>
      </div>
      {activeRecord.feedback.pressurePrompt && <div className="pressure-callout">{activeRecord.feedback.pressurePrompt}</div>}
      <div className="better-answer"><b>Better version of the answer:</b><p>{q.betterAnswer}</p></div>
      <div className="follow-up"><b>Follow-up question:</b> {q.followUp}</div>
      <div className="actions"><button onClick={nextQuestion}>{mode === "mock" ? "Next Mock Question" : "Next Question"}</button></div>
    </div>}

    <div className="interviewer-history">
      <h3>Interview History</h3>
      <p>Saved in this browser: questions, your answers, scores, improved answer guidance, weak areas, and Leadership Principles.</p>
      {weakAreas.length > 0 && <p><b>Areas to drill again:</b> {Array.from(new Set(weakAreas)).join(", ")}</p>}
      <div className="history-list">{records.slice(-5).reverse().map(item => <article key={item.gradeKey || item.at}><div className="answer-top"><span>{item.mode}</span><b>{item.score}/5</b></div><h4>{item.question}</h4><p>{item.answer}</p><small>{item.role} · {new Date(item.at).toLocaleString()}</small></article>)}</div>
    </div>
  </section>;
}

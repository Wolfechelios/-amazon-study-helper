export const starGuide = "STAR: Situation, Task, Action, Result. Keep each answer specific, personal, and outcome-focused.";

export const starExamples = [
  {
    title: "CPU triage",
    text: "S: A host was reported slow. T: I needed to determine if CPU was the bottleneck. A: I checked top or htop, load average, high CPU processes, run queue, and logs. R: I identified whether it was normal workload, a runaway process, or something to escalate."
  },
  {
    title: "Network link issue",
    text: "S: A server link was down or unstable. T: I needed to isolate host, cable, optic, or switch side. A: I started at Layer 1, checked seating, link light, cable path, optic state, counters, and far end. R: I narrowed the fault and gave a clear handoff."
  },
  {
    title: "Safety ownership",
    text: "S: I noticed a task condition that was unclear or unsafe. T: I had to protect people, equipment, and the process. A: I paused, communicated the concern, verified the correct method, and continued only when controlled. R: The job was completed safely and without avoidable rework."
  },
  {
    title: "Ticket documentation",
    text: "S: I worked a ticket another shift might inherit. T: I needed the record to be useful. A: I documented symptoms, checks, time, asset details, action taken, validation, and next step. R: The handoff was clear and nobody had to start from zero."
  },
  {
    title: "Ownership",
    text: "S: I saw an issue connected to my work but not fully assigned to me. T: I needed to make sure the outcome was handled. A: I gathered facts, communicated status, documented the work, and followed through. R: The issue did not get lost and the work moved forward."
  }
];

export type EotAnswer = {
  id: number;
  category: "Opening" | "Motivation" | "Technical" | "Safety" | "Behavioral" | "Leadership" | "Process" | "Closing" | "Questions";
  question: string;
  answer: string;
  principles: string;
};

export const eotInterviewBank: EotAnswer[] = [
  {
    id: 1,
    category: "Opening",
    question: "Tell me about yourself.",
    answer: "S: I come from a hands-on technical background in electrical work, troubleshooting, controls, motors, conduit, transformers, panels, and mechanical systems.\nT: My goal has always been to become the person who can diagnose problems quickly, work safely, and keep systems operating instead of replacing parts blindly.\nA: I have worked across commercial, industrial, and residential environments, including wiring, equipment troubleshooting, motors, breakers, transformers, and control-related issues. I am comfortable reading prints, using meters, isolating faults, following safety procedures, and learning new systems quickly.\nR: That background fits Engineering Operations because the role requires someone who can operate, maintain, and troubleshoot critical infrastructure while staying calm under pressure.",
    principles: "Ownership, Learn and Be Curious, Deliver Results"
  },
  {
    id: 2,
    category: "Motivation",
    question: "Why do you want to work as an Engineering Operations Technician at Amazon?",
    answer: "S: In my electrical career, I have always been drawn to systems where reliability matters: power, controls, motors, and equipment people depend on.\nT: I want a role where my troubleshooting and electrical experience can support a larger mission.\nA: Amazon data centers stand out because the infrastructure has to be maintained at a high level. It is not just fixing something after it fails; it is preventing failure through PMs, inspections, documentation, teamwork, and quick response.\nR: I want to grow with UPS systems, generators, switchgear, cooling systems, and data center operations while helping maintain uptime and safety for AWS customers.",
    principles: "Customer Obsession, Ownership, Learn and Be Curious"
  },
  {
    id: 3,
    category: "Technical",
    question: "Tell me about a time you solved a difficult electrical problem.",
    answer: "S: Equipment was acting inconsistently. It would run correctly sometimes, then fail or trip under certain conditions.\nT: My responsibility was to find the actual cause instead of guessing and replacing parts.\nA: I checked incoming voltage, terminations, grounding, breaker condition, load-side readings, and signs of heat or loose connections. Then I followed the circuit step by step and compared what I saw against what should have been happening.\nR: Once the weak point was corrected, the equipment operated normally. More importantly, I prevented repeat failures by finding the root cause instead of treating the symptom.",
    principles: "Dive Deep, Insist on the Highest Standards, Deliver Results"
  },
  {
    id: 4,
    category: "Safety",
    question: "Tell me about a time you worked safely under pressure.",
    answer: "S: I was working on a system where there was pressure to get equipment back online quickly.\nT: My job was to restore operation, but not at the expense of safety.\nA: I slowed the situation down enough to verify the circuit, identify energy sources, use proper PPE, test before touching, and control the work area. I communicated that rushing could create a bigger problem or injury.\nR: The issue was corrected without injury, damage, or unnecessary risk. I learned that speed matters, but safe speed matters more.",
    principles: "Ownership, Earn Trust, Insist on the Highest Standards"
  },
  {
    id: 5,
    category: "Behavioral",
    question: "Tell me about a time you had to learn something new quickly.",
    answer: "S: I have been placed in situations where the equipment or system was not something I worked on every day.\nT: I still had to become useful quickly and solve the problem.\nA: I broke the system down into fundamentals: power source, controls, load, safeties, wiring path, and expected sequence of operation. I asked targeted questions, reviewed diagrams or manuals when available, and used my meter to verify each step instead of assuming.\nR: I was able to understand the system enough to troubleshoot it and complete the work. That approach helps me learn new equipment because I focus on principles first, then details.",
    principles: "Learn and Be Curious, Dive Deep, Bias for Action"
  },
  {
    id: 6,
    category: "Behavioral",
    question: "Tell me about a time you made a mistake.",
    answer: "S: Earlier in my career, I moved too quickly and assumed a problem was caused by the most obvious component.\nT: I needed to correct the issue and make sure it did not happen again.\nA: After the first fix did not fully solve the problem, I stopped and went back to a proper troubleshooting process. I checked the circuit from source to load, verified readings, and found that the real issue was deeper in the system.\nR: I corrected the actual problem and learned not to skip diagnostic steps. Now I verify power, verify control, verify load, check connections, then repair.",
    principles: "Learn and Be Curious, Dive Deep, Ownership"
  },
  {
    id: 7,
    category: "Behavioral",
    question: "Tell me about a time you had conflict with a coworker.",
    answer: "S: I worked with someone who wanted to do a job one way, while I believed there was a safer or cleaner method.\nT: My responsibility was to keep the work moving without turning it into an argument.\nA: I focused on the job, not ego. I explained my concern clearly, referenced the safety or quality reason, listened to their point, and suggested a method that solved both concerns.\nR: We completed the work without conflict escalating. I learned that earning trust comes from staying calm, being specific, and focusing on the outcome.",
    principles: "Earn Trust, Have Backbone; Disagree and Commit, Ownership"
  },
  {
    id: 8,
    category: "Technical",
    question: "Tell me about a time you had to troubleshoot without all the information.",
    answer: "S: I was called to a problem where the description was vague. The equipment was not working correctly, but nobody could clearly explain when it started or what changed.\nT: I had to diagnose the issue with limited history.\nA: I gathered what information I could, then started with observable facts: power, controls, connections, breaker condition, load behavior, and visible signs like heat, vibration, smell, corrosion, or loose wiring. I worked systematically and documented what I found.\nR: I narrowed the problem down and corrected it. The key was using a structured process to create the information I needed.",
    principles: "Bias for Action, Dive Deep, Deliver Results"
  },
  {
    id: 9,
    category: "Process",
    question: "Tell me about a time you improved a process.",
    answer: "S: On jobs where multiple people are working, tools, parts, and steps can become disorganized fast.\nT: I wanted to make the workflow cleaner and reduce confusion.\nA: I organized work by sequence: materials, tools, measurements, circuit paths, housekeeping, labeling, and documentation while the work was being done.\nR: The job moved smoother, there were fewer delays, and it was easier for the next person to understand what had been done. In a data center, I would apply the same mindset to PMs, rounds, logs, and shift turnover.",
    principles: "Invent and Simplify, Insist on the Highest Standards, Ownership"
  },
  {
    id: 10,
    category: "Behavioral",
    question: "Tell me about a time you had to work with urgency.",
    answer: "S: I was on a job where equipment needed to be restored quickly because downtime was affecting operations.\nT: I had to respond fast while still troubleshooting correctly.\nA: I identified the highest-probability causes first: power supply, breaker status, loose terminations, control voltage, overloads, and equipment condition. I communicated what I was checking so the team knew the status.\nR: The issue was resolved efficiently and the equipment returned to service. I learned that urgency does not mean panic; it means disciplined action.",
    principles: "Bias for Action, Deliver Results, Ownership"
  },
  {
    id: 11,
    category: "Process",
    question: "Tell me about a time you had to follow a strict procedure.",
    answer: "S: Electrical work often requires following specific procedures because one skipped step can create injury, equipment damage, or a failed inspection.\nT: My responsibility was to complete the task correctly and safely.\nA: I verified scope, identified equipment, isolated the circuit if needed, tested properly, performed the work, inspected connections, and verified operation before closing out.\nR: The work passed verification and the system operated correctly. That discipline matters in data center work because procedures protect uptime and safety.",
    principles: "Insist on the Highest Standards, Ownership, Earn Trust"
  },
  {
    id: 12,
    category: "Technical",
    question: "Tell me about a time you found a problem before it became serious.",
    answer: "S: During electrical work, I noticed signs that something was not right before a full failure occurred, such as heat, discoloration, loose hardware, unusual sound, or readings that did not match expectations.\nT: I had to decide whether it was worth stopping to investigate.\nA: I checked the condition carefully, verified with my meter, inspected the connection or equipment, and communicated the concern instead of ignoring it.\nR: Addressing it early prevented a bigger issue later. That taught me the value of inspections and preventive maintenance, which directly connects to data center reliability.",
    principles: "Dive Deep, Ownership, Customer Obsession"
  },
  {
    id: 13,
    category: "Communication",
    question: "Tell me about a time you communicated technical information to a non-technical person.",
    answer: "S: I have had situations where a customer, manager, or coworker needed to understand a technical issue without getting buried in electrical terms.\nT: My job was to explain the problem clearly enough for them to make a decision.\nA: I explained what was wrong, why it mattered, what could happen if ignored, and what the repair would do. I avoided overcomplicating it while still giving enough detail to be trusted.\nR: The person understood the risk and approved the correct action. Good communication prevented confusion and helped the work move forward.",
    principles: "Earn Trust, Customer Obsession, Are Right A Lot"
  },
  {
    id: 14,
    category: "Leadership",
    question: "Tell me about a time you disagreed with a decision.",
    answer: "S: I disagreed with how a task was going to be done because I believed it could create a safety, quality, or reliability issue.\nT: I needed to speak up respectfully and support my concern with facts.\nA: I explained what I was seeing, the possible risk, and a better option. I kept it professional and focused on the equipment and outcome. If the final decision was different and safe/legal, I committed to executing it properly.\nR: In some cases, the plan changed. In others, I supported the final call. Either way, I maintained trust because I raised the concern the right way.",
    principles: "Have Backbone; Disagree and Commit, Earn Trust, Ownership"
  },
  {
    id: 15,
    category: "Behavioral",
    question: "Tell me about a time you handled multiple priorities.",
    answer: "S: On busy jobs, several things can happen at once: material issues, troubleshooting, inspections, coordination with other trades, and deadlines.\nT: I had to decide what needed attention first.\nA: I prioritized safety first, then system impact, then schedule. If something affected power, safety, or another crew's ability to continue, I handled that first or communicated it immediately.\nR: The work stayed organized and the most important issues were handled first. That is how I would approach rounds, alarms, PMs, and tickets in an Amazon data center.",
    principles: "Deliver Results, Bias for Action, Ownership"
  },
  {
    id: 16,
    category: "Behavioral",
    question: "Tell me about a time you worked on a team.",
    answer: "S: Electrical and mechanical work often requires coordination with electricians, mechanics, contractors, and supervisors.\nT: My responsibility was to complete my part while keeping the team aligned.\nA: I communicated what I was working on, asked questions when needed, helped others when my task was complete, and made sure my work did not create problems for the next person.\nR: The team completed the work more efficiently and with fewer mistakes. Strong technical teams are built on communication, clean handoffs, and ownership.",
    principles: "Earn Trust, Ownership, Deliver Results"
  },
  {
    id: 17,
    category: "Technical",
    question: "Tell me about a time you used data or measurements to make a decision.",
    answer: "S: I had a situation where the problem could not be solved by looking at the equipment alone.\nT: I needed to prove what was happening electrically.\nA: I used meter readings to check voltage, continuity, resistance, load behavior, and control voltage. I compared the readings to what the circuit should have been doing.\nR: The readings pointed me toward the real issue and helped me make the correct repair. That reinforced the importance of verifying facts before taking action.",
    principles: "Dive Deep, Are Right A Lot, Insist on the Highest Standards"
  },
  {
    id: 18,
    category: "Safety",
    question: "What would you do if you saw an unsafe condition in the data center?",
    answer: "S: If I saw an unsafe condition, I would treat it seriously, even if the job was urgent.\nT: My responsibility would be to protect people, equipment, and the site.\nA: I would stop or control the immediate hazard if I could do so safely, notify the proper lead or manager, follow site procedure, and document or report the condition. If equipment needed isolation, I would follow the proper lockout/tagout or escalation process.\nR: The goal would be to prevent injury or equipment damage while keeping the team informed. In critical environments, small unsafe conditions can become major incidents if ignored.",
    principles: "Ownership, Earn Trust, Insist on the Highest Standards"
  },
  {
    id: 19,
    category: "Leadership",
    question: "What is the difference between how you would approach L3 and L4?",
    answer: "For L3, I would focus on becoming extremely reliable at execution: completing PMs, responding to alarms, documenting work, learning site systems, following procedures, and escalating correctly.\n\nFor L4, I would still be hands-on, but I would also think more like an owner: helping improve procedures, mentoring others, coordinating vendors, identifying risk, communicating clearly during incidents, and helping prevent repeat issues.\n\nStrong line: I understand L3 is about being a dependable hands-on technician, while L4 expects more ownership, judgment, communication, and leadership during operations. I am prepared to execute at a high level and grow into more responsibility.",
    principles: "Ownership, Deliver Results, Earn Trust"
  },
  {
    id: 20,
    category: "Closing",
    question: "Why should Amazon hire you?",
    answer: "S: Amazon Engineering Operations needs technicians who can be trusted around critical systems.\nT: The role requires safety, troubleshooting ability, ownership, communication, and willingness to keep learning.\nA: My background gives me hands-on experience with electrical systems, mechanical troubleshooting, motors, controls, conduit, panels, transformers, meters, and real field problem-solving. I do not just want to replace parts; I want to understand the system, find the cause, and prevent repeat problems.\nR: If hired, I would bring a strong work ethic, field experience, safety mindset, and the ability to learn Amazon data center systems quickly. I would focus on being reliable, coachable, and useful to the team from day one.",
    principles: "Ownership, Deliver Results, Learn and Be Curious"
  }
];

export const closingQuestions = [
  "What separates a strong L3 technician from someone ready for L4?",
  "What systems should I focus on learning first: UPS, generators, switchgear, cooling, or controls?",
  "What does success look like in the first 90 days?",
  "How does the team handle shift turnover, alarms, and incident response?",
  "What are the most common challenges new EOTs face at this site?"
];

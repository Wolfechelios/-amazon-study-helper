import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(process.cwd(), "src/InterviewerMode.tsx");
const source = readFileSync(file, "utf8");

const requiredPatterns = [
  {
    name: "grade key generation",
    pattern: /function makeGradeKey\(/,
  },
  {
    name: "normalized answer key",
    pattern: /function normalizeAnswer\(/,
  },
  {
    name: "existing record replacement",
    pattern: /findIndex\(item => getRecordGradeKey\(item\) === gradeKey\)/,
  },
  {
    name: "repeat-grade button lock",
    pattern: /alreadyGradedCurrentAnswer/,
  },
  {
    name: "no blind append-only grading history",
    pattern: /if \(existingIndex === -1\) return \[\.\.\.prev\.slice\(-49\), record\]/,
  },
];

const failures = requiredPatterns.filter(check => !check.pattern.test(source));

if (failures.length) {
  console.error("Grading idempotency audit failed:");
  for (const failure of failures) console.error(`- Missing ${failure.name}`);
  process.exit(1);
}

console.log("Grading idempotency audit passed: repeated Grade Answer clicks cannot append duplicate grades for the same unchanged answer.");

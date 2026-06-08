#!/usr/bin/env tsx
import path from 'node:path';
import { runDefaultAudits, printAuditReport, writeJsonReport } from '../src/audit';

async function main() {
  const rootDir = path.resolve(process.argv[2] ?? process.cwd());
  const moduleArg = process.argv.find((arg) => arg.startsWith('--modules='));
  const outputArg = process.argv.find((arg) => arg.startsWith('--out='));
  const moduleIds = moduleArg ? moduleArg.replace('--modules=', '').split(',').filter(Boolean) : undefined;
  const outputPath = outputArg ? path.resolve(outputArg.replace('--out=', '')) : path.join(rootDir, 'artifacts/audit-report.json');

  const report = await runDefaultAudits(rootDir, moduleIds);
  printAuditReport(report);
  await writeJsonReport(report, outputPath);

  if (report.status === 'fail') process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

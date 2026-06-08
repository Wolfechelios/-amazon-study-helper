import { AuditRunReport } from '../types';

const icon = { pass: '✓', warn: '!', fail: '✕', skip: '-' } as const;

export function printAuditReport(report: AuditRunReport): void {
  console.log(`\nAudit ${report.status.toUpperCase()} | Score ${report.score}/100 | ${report.durationMs}ms`);
  console.log(`Modules: ${report.totals.pass} pass, ${report.totals.warn} warn, ${report.totals.fail} fail, ${report.totals.skip} skip`);
  console.log(`Issues: ${report.totals.issues} total (${report.totals.critical} critical, ${report.totals.error} error, ${report.totals.warning} warning)\n`);

  for (const result of report.results) {
    console.log(`${icon[result.status]} ${result.moduleName} [${result.status}] score=${result.score}`);
    for (const issue of result.issues) {
      const where = issue.file ? ` ${issue.file}${issue.line ? `:${issue.line}` : ''}` : '';
      console.log(`  - ${issue.severity.toUpperCase()}: ${issue.title}${where}`);
      console.log(`    ${issue.message}`);
      if (issue.fix) console.log(`    Fix: ${issue.fix}`);
    }
  }
}

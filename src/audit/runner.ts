import { AuditContext, AuditRunReport, AuditStatus } from './types';
import { AuditRegistry } from './registry';

function finalStatus(results: { status: AuditStatus }[]): AuditStatus {
  if (results.some((r) => r.status === 'fail')) return 'fail';
  if (results.some((r) => r.status === 'warn')) return 'warn';
  if (results.every((r) => r.status === 'skip')) return 'skip';
  return 'pass';
}

export async function runAudits(
  registry: AuditRegistry,
  context: AuditContext,
  moduleIds?: string[],
): Promise<AuditRunReport> {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  const modules = registry.enabled(moduleIds);

  const results = [];
  for (const module of modules) {
    try {
      results.push(await module.run(context));
    } catch (error) {
      results.push({
        moduleId: module.id,
        moduleName: module.name,
        status: 'fail' as const,
        score: 0,
        durationMs: 0,
        issues: [{
          id: `${module.id}.runtime-error`,
          title: 'Audit module crashed',
          message: error instanceof Error ? error.message : String(error),
          severity: 'critical' as const,
          fix: 'Fix the audit module or wrap risky checks with safe error handling.',
        }],
      });
    }
  }

  const finished = Date.now();
  const issues = results.flatMap((r) => r.issues);

  return {
    status: finalStatus(results),
    score: results.length ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
    startedAt,
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    results,
    totals: {
      pass: results.filter((r) => r.status === 'pass').length,
      warn: results.filter((r) => r.status === 'warn').length,
      fail: results.filter((r) => r.status === 'fail').length,
      skip: results.filter((r) => r.status === 'skip').length,
      issues: issues.length,
      critical: issues.filter((i) => i.severity === 'critical').length,
      error: issues.filter((i) => i.severity === 'error').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
  };
}

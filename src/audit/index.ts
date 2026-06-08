import { AuditRegistry } from './registry';
import { runAudits } from './runner';
import { configAudit, routeAudit, securityAudit, uiAudit } from './modules';

export * from './types';
export * from './registry';
export * from './runner';
export * from './reporters/consoleReporter';
export * from './reporters/jsonReporter';

export function createDefaultAuditRegistry(): AuditRegistry {
  return new AuditRegistry()
    .register(configAudit)
    .register(routeAudit)
    .register(uiAudit)
    .register(securityAudit);
}

export async function runDefaultAudits(rootDir: string, moduleIds?: string[]) {
  return runAudits(createDefaultAuditRegistry(), { rootDir, env: process.env }, moduleIds);
}

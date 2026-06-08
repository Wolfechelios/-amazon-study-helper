export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditStatus = 'pass' | 'warn' | 'fail' | 'skip';

export interface AuditContext {
  rootDir: string;
  env?: Record<string, string | undefined>;
  changedFiles?: string[];
  options?: Record<string, unknown>;
}

export interface AuditIssue {
  id: string;
  title: string;
  message: string;
  severity: AuditSeverity;
  file?: string;
  line?: number;
  fix?: string;
  meta?: Record<string, unknown>;
}

export interface AuditResult {
  moduleId: string;
  moduleName: string;
  status: AuditStatus;
  score: number;
  durationMs: number;
  issues: AuditIssue[];
  summary?: string;
}

export interface AuditModule {
  id: string;
  name: string;
  description?: string;
  category: 'ui' | 'routing' | 'security' | 'config' | 'performance' | 'code' | 'build' | 'custom';
  enabledByDefault?: boolean;
  run(context: AuditContext): Promise<AuditResult>;
}

export interface AuditRunReport {
  status: AuditStatus;
  score: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  results: AuditResult[];
  totals: {
    pass: number;
    warn: number;
    fail: number;
    skip: number;
    issues: number;
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
}

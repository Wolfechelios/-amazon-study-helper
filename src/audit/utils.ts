import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AuditIssue, AuditResult, AuditStatus } from './types';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function walkFiles(rootDir: string, extensions: string[]): Promise<string[]> {
  const out: string[] = [];
  const ignored = new Set(['node_modules', 'dist', 'build', '.next', 'coverage', 'artifacts']);

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(full);
    }
  }

  await walk(rootDir);
  return out;
}

export function makeResult(input: {
  moduleId: string;
  moduleName: string;
  startedAt: number;
  issues?: AuditIssue[];
  skipped?: boolean;
  summary?: string;
}): AuditResult {
  const issues = input.issues ?? [];
  const status: AuditStatus = input.skipped
    ? 'skip'
    : issues.some((i) => i.severity === 'critical' || i.severity === 'error')
      ? 'fail'
      : issues.some((i) => i.severity === 'warning')
        ? 'warn'
        : 'pass';

  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === 'critical') return sum + 35;
    if (issue.severity === 'error') return sum + 20;
    if (issue.severity === 'warning') return sum + 8;
    return sum + 2;
  }, 0);

  return {
    moduleId: input.moduleId,
    moduleName: input.moduleName,
    status,
    score: input.skipped ? 0 : Math.max(0, 100 - penalty),
    durationMs: Date.now() - input.startedAt,
    issues,
    summary: input.summary,
  };
}

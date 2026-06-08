import path from 'node:path';
import { AuditModule } from '../types';
import { makeResult, walkFiles, readText } from '../utils';

export const securityAudit: AuditModule = {
  id: 'security.secret-scan',
  name: 'Basic Secret Scan',
  category: 'security',
  enabledByDefault: true,
  description: 'Catches obvious secrets before commits or builds.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];
    const files = await walkFiles(context.rootDir, ['.ts', '.tsx', '.js', '.jsx', '.json', '.env']);
    const secretPatterns = [
      { id: 'openai-key', rx: /sk-[A-Za-z0-9_-]{20,}/ },
      { id: 'generic-secret', rx: /(api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{16,}["']/i },
    ];

    for (const fullPath of files) {
      const rel = path.relative(context.rootDir, fullPath);
      if (rel.includes('package-lock.json')) continue;
      const lines = (await readText(fullPath)).split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const pattern of secretPatterns) {
          if (pattern.rx.test(line)) {
            issues.push({
              id: `security.secret.${pattern.id}`,
              title: 'Possible hard-coded secret',
              message: 'A line looks like it may contain a credential or API key.',
              severity: 'critical' as const,
              file: rel,
              line: index + 1,
              fix: 'Move secrets into environment variables and rotate any exposed key.',
            });
          }
        }
      });
    }

    return makeResult({ moduleId: this.id, moduleName: this.name, startedAt, issues });
  },
};

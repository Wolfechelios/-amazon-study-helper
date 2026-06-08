import path from 'node:path';
import { AuditModule } from '../types';
import { makeResult, walkFiles, readText } from '../utils';

export const routeAudit: AuditModule = {
  id: 'routing.empty-values',
  name: 'Routing and Select Value Audit',
  category: 'routing',
  enabledByDefault: true,
  description: 'Finds fragile route/select patterns that commonly break Safari and selection components.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];
    const files = await walkFiles(context.rootDir, ['.tsx', '.ts', '.jsx', '.js']);

    for (const fullPath of files) {
      const rel = path.relative(context.rootDir, fullPath);
      const text = await readText(fullPath);
      const lines = text.split(/\r?\n/);

      lines.forEach((line, index) => {
        if (/<SelectItem[^>]*value=["']{2}/.test(line)) {
          issues.push({
            id: 'routing.select-item.empty-value',
            title: 'Empty SelectItem value',
            message: 'SelectItem value cannot be an empty string. This can crash selection behavior.',
            severity: 'error' as const,
            file: rel,
            line: index + 1,
            fix: 'Use a non-empty sentinel value such as "__none__" and map it to empty state in code.',
          });
        }
        if (/window\.location\s*=/.test(line)) {
          issues.push({
            id: 'routing.hard-navigation',
            title: 'Hard browser navigation detected',
            message: 'Direct window.location assignment can break app-shell routing.',
            severity: 'warning' as const,
            file: rel,
            line: index + 1,
            fix: 'Prefer an app navigation helper so routes stay consistent.',
          });
        }
      });
    }

    return makeResult({ moduleId: this.id, moduleName: this.name, startedAt, issues });
  },
};

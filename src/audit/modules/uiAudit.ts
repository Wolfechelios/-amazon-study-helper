import path from 'node:path';
import { AuditModule } from '../types';
import { makeResult, walkFiles, readText } from '../utils';

export const uiAudit: AuditModule = {
  id: 'ui.black-screen-guards',
  name: 'UI Black Screen Guard Audit',
  category: 'ui',
  enabledByDefault: true,
  description: 'Checks for common UI startup failure patterns and missing error boundaries.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];
    const files = await walkFiles(context.rootDir, ['.tsx', '.jsx']);
    let hasErrorBoundary = false;

    for (const fullPath of files) {
      const rel = path.relative(context.rootDir, fullPath);
      const text = await readText(fullPath);
      if (/ErrorBoundary|componentDidCatch|getDerivedStateFromError/.test(text)) hasErrorBoundary = true;

      if (/return\s+null/.test(text) && /loading|initializing|boot/i.test(text)) {
        issues.push({
          id: 'ui.startup.return-null',
          title: 'Startup can render blank/null',
          message: 'A startup/loading path returns null, which can look like a black screen.',
          severity: 'warning' as const,
          file: rel,
          fix: 'Render a visible loading/fallback panel with diagnostic status instead of null.',
        });
      }
    }

    if (!hasErrorBoundary) {
      issues.push({
        id: 'ui.error-boundary.missing',
        title: 'Missing app error boundary',
        message: 'No obvious React error boundary was found.',
        severity: 'error' as const,
        fix: 'Add an ErrorBoundary around the main app shell so crashes show diagnostics instead of a black screen.',
      });
    }

    return makeResult({ moduleId: this.id, moduleName: this.name, startedAt, issues });
  },
};

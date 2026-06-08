import path from 'node:path';
import { AuditModule } from '../types';
import { makeResult, walkFiles, readText, fileExists } from '../utils';

export const uiAudit: AuditModule = {
  id: 'ui.black-screen-guards',
  name: 'UI Black Screen Guard Audit',
  category: 'ui',
  enabledByDefault: true,
  description: 'Checks for common UI startup failure patterns and verifies error-boundary integration.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];
    const files = await walkFiles(context.rootDir, ['.tsx', '.jsx']);
    const mainCandidates = ['src/main.tsx', 'src/main.jsx', 'src/App.tsx', 'src/App.jsx'];
    let hasErrorBoundaryDefinition = false;
    let hasErrorBoundaryIntegration = false;

    for (const fullPath of files) {
      const rel = path.relative(context.rootDir, fullPath);
      const text = await readText(fullPath);

      if (/componentDidCatch|getDerivedStateFromError/.test(text)) {
        hasErrorBoundaryDefinition = true;
      }

      const isMainFile = mainCandidates.includes(rel.replaceAll('\\', '/'));
      if (isMainFile && /<ErrorBoundary[\s>]/.test(text) && /render\s*\(/.test(text)) {
        hasErrorBoundaryIntegration = true;
      }

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

      if (/document\.getElementById\(["']root["']\)!/.test(text)) {
        issues.push({
          id: 'ui.root-null-assertion',
          title: 'Root element uses non-null assertion',
          message: 'The app assumes #root always exists. If index.html changes, startup fails hard.',
          severity: 'warning' as const,
          file: rel,
          fix: 'Check the root element and throw a clear diagnostic error before createRoot.',
        });
      }
    }

    const indexHtml = path.join(context.rootDir, 'index.html');
    if (!(await fileExists(indexHtml))) {
      issues.push({
        id: 'ui.index-html.missing',
        title: 'index.html missing',
        message: 'Vite apps need index.html at the project root.',
        severity: 'critical' as const,
        fix: 'Restore index.html with a root element and script entrypoint.',
      });
    } else {
      const html = await readText(indexHtml);
      if (!/id=["']root["']/.test(html)) {
        issues.push({
          id: 'ui.root-element.missing',
          title: 'Root mount element missing',
          message: 'index.html does not contain an element with id="root".',
          severity: 'critical' as const,
          file: 'index.html',
          fix: 'Add <div id="root"></div> before the app script.',
        });
      }
    }

    if (!hasErrorBoundaryDefinition) {
      issues.push({
        id: 'ui.error-boundary.definition-missing',
        title: 'Missing app error boundary definition',
        message: 'No React error boundary class or equivalent fallback handler was found.',
        severity: 'error' as const,
        fix: 'Add an ErrorBoundary component that catches render failures.',
      });
    } else if (!hasErrorBoundaryIntegration) {
      issues.push({
        id: 'ui.error-boundary.not-wrapped',
        title: 'Error boundary exists but is not wired into app startup',
        message: 'An ErrorBoundary component exists, but the app entrypoint does not wrap the rendered App with it.',
        severity: 'error' as const,
        file: 'src/main.tsx',
        fix: 'Import ErrorBoundary in src/main.tsx and render <ErrorBoundary><App /></ErrorBoundary>.',
      });
    }

    return makeResult({ moduleId: this.id, moduleName: this.name, startedAt, issues });
  },
};

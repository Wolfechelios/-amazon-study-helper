import path from 'node:path';
import { AuditModule } from '../types';
import { fileExists, makeResult, readText, walkFiles } from '../utils';

function safeJson(text: string): Record<string, any> | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export const firebreakAudit: AuditModule = {
  id: 'firebreak.integrity',
  name: 'Firebreak Audit Integrity Gate',
  category: 'build',
  enabledByDefault: true,
  description: 'Prevents false-perfect audit reports by verifying the audit system, app entrypoint, and critical runtime surface exist together.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];

    const requiredFiles = [
      'package.json',
      'index.html',
      'src/main.tsx',
      'src/styles.css',
      'src/audit/index.ts',
      'src/audit/runner.ts',
      'src/audit/registry.ts',
      'src/audit/types.ts',
      'src/audit/utils.ts',
      'scripts/audit.ts',
      'scripts/no-man-left-behind-audit.ts',
    ];

    for (const rel of requiredFiles) {
      if (!(await fileExists(path.join(context.rootDir, rel)))) {
        issues.push({
          id: 'firebreak.required-file.missing',
          title: 'Critical file missing',
          message: `${rel} is required for the app and audit system to be trustworthy.`,
          severity: 'critical' as const,
          file: rel,
          fix: 'Restore the missing file before trusting any audit score.',
        });
      }
    }

    const packagePath = path.join(context.rootDir, 'package.json');
    if (await fileExists(packagePath)) {
      const pkgText = await readText(packagePath);
      const pkg = safeJson(pkgText);
      if (!pkg) {
        issues.push({
          id: 'firebreak.package-json.invalid',
          title: 'package.json is invalid JSON',
          message: 'The app cannot be installed, built, or audited reliably with invalid package metadata.',
          severity: 'critical' as const,
          file: 'package.json',
          fix: 'Fix package.json syntax and rerun npm install, npm run build, and npm run audit:firebreak.',
        });
      } else {
        const scripts = pkg.scripts ?? {};
        for (const script of ['dev', 'build', 'audit:app', 'audit:firebreak', 'audit:runthrough', 'audit:complete']) {
          if (!scripts[script]) {
            issues.push({
              id: `firebreak.script.${script}.missing`,
              title: `Missing npm script: ${script}`,
              message: `package.json should expose "${script}" so local checks are repeatable.`,
              severity: ['audit:firebreak', 'audit:runthrough', 'audit:complete'].includes(script) ? 'error' as const : 'warning' as const,
              file: 'package.json',
              fix: `Add a stable "${script}" script.`,
            });
          }
        }
      }
    }

    const moduleIndexPath = path.join(context.rootDir, 'src/audit/modules/index.ts');
    if (await fileExists(moduleIndexPath)) {
      const moduleIndex = await readText(moduleIndexPath);
      for (const exported of ['configAudit', 'routeAudit', 'uiAudit', 'securityAudit', 'firebreakAudit']) {
        if (!moduleIndex.includes(exported)) {
          issues.push({
            id: 'firebreak.module-export.missing',
            title: 'Audit module is not exported',
            message: `${exported} is not exported from src/audit/modules/index.ts.`,
            severity: 'error' as const,
            file: 'src/audit/modules/index.ts',
            fix: 'Export every default audit module from the module barrel file.',
          });
        }
      }
    }

    const auditIndexPath = path.join(context.rootDir, 'src/audit/index.ts');
    if (await fileExists(auditIndexPath)) {
      const auditIndex = await readText(auditIndexPath);
      for (const registered of ['configAudit', 'routeAudit', 'uiAudit', 'securityAudit', 'firebreakAudit']) {
        if (!auditIndex.includes(`register(${registered})`)) {
          issues.push({
            id: 'firebreak.registry-registration.missing',
            title: 'Audit module is not registered',
            message: `${registered} is not registered in createDefaultAuditRegistry().`,
            severity: 'error' as const,
            file: 'src/audit/index.ts',
            fix: 'Register the module so npm run audit:app cannot skip it silently.',
          });
        }
      }
    }

    const mainPath = path.join(context.rootDir, 'src/main.tsx');
    if (await fileExists(mainPath)) {
      const main = await readText(mainPath);
      if (!hasAny(main, [/createRoot\(/, /ReactDOM\.createRoot\(/])) {
        issues.push({
          id: 'firebreak.react-root.missing',
          title: 'React root mount not detected',
          message: 'src/main.tsx does not appear to mount the React app.',
          severity: 'critical' as const,
          file: 'src/main.tsx',
          fix: 'Restore the createRoot/render startup path.',
        });
      }
      if (!hasAny(main, [/localStorage\./, /useState\(/, /useMemo\(/])) {
        issues.push({
          id: 'firebreak.app-behavior.surface-too-thin',
          title: 'App behavior surface looks too thin',
          message: 'The entrypoint does not show enough interactive state/persistence behavior for this study app.',
          severity: 'warning' as const,
          file: 'src/main.tsx',
          fix: 'Confirm the real app code is present, not a placeholder or stripped shell.',
        });
      }
    }

    const sourceFiles = await walkFiles(path.join(context.rootDir, 'src'), ['.ts', '.tsx']).catch(() => []);
    if (sourceFiles.length < 6) {
      issues.push({
        id: 'firebreak.source-file-count.low',
        title: 'Source tree is unexpectedly small',
        message: `Only ${sourceFiles.length} TypeScript/TSX files were found under src.`,
        severity: 'warning' as const,
        fix: 'Verify this is the complete app before trusting a high audit score.',
        meta: { sourceFiles: sourceFiles.length },
      });
    }

    return makeResult({
      moduleId: this.id,
      moduleName: this.name,
      startedAt,
      issues,
      summary: 'Firebreak validates the audit harness, app shell, and browser run-through audit before accepting a perfect score.',
    });
  },
};

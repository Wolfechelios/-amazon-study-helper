import path from 'node:path';
import { AuditModule } from '../types';
import { fileExists, makeResult, readText } from '../utils';

export const configAudit: AuditModule = {
  id: 'config.required-files',
  name: 'Required Config Files',
  category: 'config',
  enabledByDefault: true,
  description: 'Checks for required project config and known missing environment defaults.',
  async run(context) {
    const startedAt = Date.now();
    const issues = [];
    const packageJson = path.join(context.rootDir, 'package.json');

    if (!(await fileExists(packageJson))) {
      issues.push({
        id: 'config.package-json.missing',
        title: 'package.json missing',
        message: 'The app root does not contain package.json.',
        severity: 'critical' as const,
        fix: 'Run this audit from the real app root or restore package.json.',
      });
    } else {
      const pkg = JSON.parse(await readText(packageJson));
      const scripts = pkg.scripts ?? {};
      for (const required of ['dev', 'build']) {
        if (!scripts[required]) {
          issues.push({
            id: `config.script.${required}.missing`,
            title: `Missing npm script: ${required}`,
            message: `package.json has no "${required}" script.`,
            severity: 'error' as const,
            file: 'package.json',
            fix: `Add a stable "${required}" script so the app can be launched and audited consistently.`,
          });
        }
      }
    }

    const envExample = path.join(context.rootDir, '.env.example');
    if (!(await fileExists(envExample))) {
      issues.push({
        id: 'config.env-example.missing',
        title: '.env.example missing',
        message: 'No .env.example file exists to document required runtime variables.',
        severity: 'warning' as const,
        fix: 'Add .env.example with app runtime defaults.',
      });
    }

    return makeResult({ moduleId: this.id, moduleName: this.name, startedAt, issues });
  },
};

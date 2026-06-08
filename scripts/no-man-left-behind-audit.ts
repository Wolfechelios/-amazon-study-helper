#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { chromium, type Browser, type Page } from 'playwright';

type Severity = 'info' | 'warning' | 'error' | 'critical';
type Status = 'pass' | 'warn' | 'fail';

type Finding = {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  fix?: string;
  meta?: Record<string, unknown>;
};

type ModuleResult = {
  id: string;
  name: string;
  status: Status;
  score: number;
  durationMs: number;
  findings: Finding[];
};

type AuditModule = {
  id: string;
  name: string;
  run(page: Page, context: RuntimeContext): Promise<Finding[]>;
};

type RuntimeContext = {
  baseUrl: string;
  consoleErrors: string[];
  pageErrors: string[];
};

const ARTIFACT_DIR = path.resolve('artifacts');
const OUT_PATH = path.join(ARTIFACT_DIR, 'audit-no-man-left-behind.json');
const PORT = Number(process.env.AUDIT_PORT || process.env.PORT || 5179);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const START_SERVER = process.env.AUDIT_START_SERVER !== 'false';

function statusFromFindings(findings: Finding[]): Status {
  if (findings.some((item) => item.severity === 'critical' || item.severity === 'error')) return 'fail';
  if (findings.some((item) => item.severity === 'warning')) return 'warn';
  return 'pass';
}

function scoreFromFindings(findings: Finding[]): number {
  const penalty = findings.reduce((sum, item) => {
    if (item.severity === 'critical') return sum + 40;
    if (item.severity === 'error') return sum + 25;
    if (item.severity === 'warning') return sum + 8;
    return sum + 2;
  }, 0);
  return Math.max(0, 100 - penalty);
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server is still booting
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startVite(): ChildProcessWithoutNullStreams {
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT) },
  });

  child.stdout.on('data', (data) => process.stdout.write(`[vite] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[vite] ${data}`));
  return child;
}

async function textOf(page: Page, selector = 'body'): Promise<string> {
  return (await page.locator(selector).innerText({ timeout: 5000 })).replace(/\s+/g, ' ').trim();
}

async function screenshot(page: Page, name: string): Promise<string> {
  const file = path.join(ARTIFACT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function changedMeaningfully(before: string, after: string): boolean {
  if (before === after) return false;
  if (Math.abs(after.length - before.length) > 8) return true;
  return before.slice(0, 240) !== after.slice(0, 240);
}

async function clickAndCheck(page: Page, label: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const button = page.getByRole('button', { name: new RegExp(label, 'i') }).first();
  if (!(await button.count())) {
    return [{
      id: `interaction.${label.toLowerCase().replace(/\s+/g, '-')}.missing`,
      title: `Missing button: ${label}`,
      message: `Expected a visible "${label}" button but it was not found.`,
      severity: 'error',
      fix: `Restore the "${label}" control or update the audit contract if the feature was intentionally removed.`,
    }];
  }

  const before = await textOf(page);
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await page.waitForTimeout(250);
  const after = await textOf(page);

  if (!changedMeaningfully(before, after)) {
    findings.push({
      id: `interaction.${label.toLowerCase().replace(/\s+/g, '-')}.no-visible-change`,
      title: `${label} produced no visible state change`,
      message: `The button clicked without crashing, but the page text did not meaningfully change. That is usually a dead or unclear interaction.`,
      severity: 'error',
      fix: 'Make the control update visible UI state, route, focus, saved content, or a clear status message.',
    });
  }

  return findings;
}

const modules: AuditModule[] = [
  {
    id: 'runtime.boot',
    name: 'App Boot and Blank Screen Guard',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.locator('#root').waitFor({ timeout: 10000 });
      const bodyText = await textOf(page);
      const rootText = await textOf(page, '#root');
      if (bodyText.length < 80 || rootText.length < 80) {
        findings.push({
          id: 'runtime.blank-screen',
          title: 'App appears blank or under-rendered',
          message: `Only ${rootText.length} characters rendered inside #root.`,
          severity: 'critical',
          fix: 'Check React startup, thrown render errors, missing data imports, and CSS hiding the shell.',
        });
      }
      await screenshot(page, 'audit-boot');
      return findings;
    },
  },
  {
    id: 'runtime.console-errors',
    name: 'Console and Runtime Error Gate',
    async run(_page, context) {
      const findings: Finding[] = [];
      for (const error of context.pageErrors) {
        findings.push({
          id: 'runtime.page-error',
          title: 'Uncaught page error',
          message: error,
          severity: 'critical',
          fix: 'Fix the thrown runtime exception before trusting UI behavior.',
        });
      }
      for (const error of context.consoleErrors) {
        findings.push({
          id: 'runtime.console-error',
          title: 'Browser console error',
          message: error,
          severity: 'error',
          fix: 'Remove console errors caused by failed resources, React crashes, or invalid DOM usage.',
        });
      }
      return findings;
    },
  },
  {
    id: 'ui.structure',
    name: 'Visual Structure and Critical Landmarks',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const h1Count = await page.locator('h1').count();
      const sectionCount = await page.locator('section').count();
      const buttonCount = await page.getByRole('button').count();
      if (h1Count !== 1) findings.push({ id: 'ui.h1.count', title: 'Unexpected H1 count', message: `Found ${h1Count} h1 elements.`, severity: 'warning', fix: 'Use one clear h1 for the screen title.' });
      if (sectionCount < 4) findings.push({ id: 'ui.sections.too-few', title: 'Too few major sections', message: `Found ${sectionCount} sections.`, severity: 'warning', fix: 'Confirm the full app shell is present.' });
      if (buttonCount < 5) findings.push({ id: 'ui.buttons.too-few', title: 'Too few controls', message: `Found ${buttonCount} buttons.`, severity: 'error', fix: 'Confirm interactive controls are rendered and not hidden.' });
      return findings;
    },
  },
  {
    id: 'feature.adaptive-coach-focus-drill',
    name: 'Adaptive Coach Focus Drill Behavior',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const before = await textOf(page);
      const start = page.getByRole('button', { name: /start focus drill/i }).first();
      if (!(await start.count())) {
        return [{
          id: 'adaptive-coach.focus-drill.missing',
          title: 'Start Focus Drill button missing',
          message: 'The Adaptive Coach panel does not expose a Start Focus Drill control.',
          severity: 'critical',
          fix: 'Restore the Start Focus Drill button in the Adaptive Coach panel.',
        }];
      }
      await start.scrollIntoViewIfNeeded();
      await start.click();
      await page.waitForTimeout(400);
      const after = await textOf(page);
      const hasTechnicalMode = /technical module/i.test(after);
      const hasFocusNotice = /focus drill/i.test(after);
      const changed = changedMeaningfully(before, after);

      if (!hasTechnicalMode) {
        findings.push({
          id: 'adaptive-coach.focus-drill.mode-not-visible',
          title: 'Focus Drill did not visibly switch mode',
          message: 'Clicking Start Focus Drill did not show the app entering technical/focused drill mode.',
          severity: 'error',
          fix: 'Update startWeakDrill() to set a visible focus mode label and reset the quiz state.',
        });
      }
      if (!hasFocusNotice) {
        findings.push({
          id: 'adaptive-coach.focus-drill.no-confirmation',
          title: 'Focus Drill has no visible confirmation',
          message: 'The click gives no clear visible confirmation that a focused drill started.',
          severity: 'error',
          fix: 'Set a savedNotice/status banner such as "Focus Drill started" and move focus/scroll to the quiz.',
        });
      }
      if (!changed) {
        findings.push({
          id: 'adaptive-coach.focus-drill.no-state-change',
          title: 'Focus Drill produced no meaningful UI change',
          message: 'The body text before and after the click was effectively unchanged.',
          severity: 'critical',
          fix: 'Make the feature filter to weak topics, reset active question, and show a visible state transition.',
        });
      }
      await screenshot(page, 'audit-focus-drill-after-click');
      return findings;
    },
  },
  {
    id: 'interactions.critical-buttons',
    name: 'Critical Button Click-Through',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      for (const label of ['Start Focus Drill', 'Save End Questions to Notes', 'Save Best Examples to Notes']) {
        findings.push(...await clickAndCheck(page, label));
      }
      return findings;
    },
  },
  {
    id: 'forms.persistence',
    name: 'Notes Form and Local Persistence',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const textarea = page.locator('textarea').first();
      if (!(await textarea.count())) {
        return [{ id: 'forms.notes-textarea.missing', title: 'Notes textarea missing', message: 'No notes textarea was found.', severity: 'error', fix: 'Restore the weak-area notes editor.' }];
      }
      const marker = `audit-note-${Date.now()}`;
      await textarea.scrollIntoViewIfNeeded();
      await textarea.fill(marker);
      await page.reload({ waitUntil: 'networkidle' });
      const persisted = await page.locator('textarea').first().inputValue();
      if (!persisted.includes(marker)) {
        findings.push({
          id: 'forms.notes.persistence-failed',
          title: 'Notes did not persist after reload',
          message: 'The notes textarea value was not restored from localStorage after reload.',
          severity: 'error',
          fix: 'Verify localStorage write/read keys and controlled textarea state.',
        });
      }
      return findings;
    },
  },
  {
    id: 'accessibility.basics',
    name: 'Accessibility and Keyboard Basics',
    async run(page) {
      const findings: Finding[] = [];
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const unlabeledButtons = await page.locator('button').evaluateAll((buttons) => buttons.filter((button) => !button.textContent?.trim() && !button.getAttribute('aria-label')).length);
      if (unlabeledButtons > 0) findings.push({ id: 'a11y.unlabeled-buttons', title: 'Unlabeled buttons found', message: `${unlabeledButtons} buttons have no visible text or aria-label.`, severity: 'error', fix: 'Give every button visible text or aria-label.' });
      await page.keyboard.press('Tab');
      const activeTag = await page.evaluate(() => document.activeElement?.tagName || '');
      if (!activeTag || activeTag === 'BODY') findings.push({ id: 'a11y.keyboard.no-focus', title: 'Keyboard focus did not move', message: 'Pressing Tab did not focus an interactive element.', severity: 'error', fix: 'Ensure controls are keyboard-focusable and not hidden/disabled.' });
      return findings;
    },
  },
  {
    id: 'responsive.viewports',
    name: 'Responsive Viewport Smoke Test',
    async run(page) {
      const findings: Finding[] = [];
      for (const viewport of [
        { width: 390, height: 844, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1440, height: 900, name: 'desktop' },
      ]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const rootBox = await page.locator('#root').boundingBox();
        const text = await textOf(page, '#root');
        if (!rootBox || rootBox.width < 250 || text.length < 80) {
          findings.push({
            id: `responsive.${viewport.name}.broken`,
            title: `${viewport.name} viewport appears broken`,
            message: `Rendered root box/text was too small at ${viewport.width}x${viewport.height}.`,
            severity: 'error',
            fix: 'Fix responsive layout, overflow, or CSS hiding content at this viewport.',
          });
        }
        await screenshot(page, `audit-responsive-${viewport.name}`);
      }
      return findings;
    },
  },
];

async function runModule(module: AuditModule, page: Page, context: RuntimeContext): Promise<ModuleResult> {
  const started = Date.now();
  try {
    const findings = await module.run(page, context);
    return {
      id: module.id,
      name: module.name,
      status: statusFromFindings(findings),
      score: scoreFromFindings(findings),
      durationMs: Date.now() - started,
      findings,
    };
  } catch (error) {
    const finding: Finding = {
      id: `${module.id}.module-crashed`,
      title: 'Audit module crashed',
      message: error instanceof Error ? error.message : String(error),
      severity: 'critical',
      fix: 'Fix the audit module or the app state that caused this module to crash.',
    };
    return {
      id: module.id,
      name: module.name,
      status: 'fail',
      score: 0,
      durationMs: Date.now() - started,
      findings: [finding],
    };
  }
}

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  let server: ChildProcessWithoutNullStreams | undefined;
  let browser: Browser | undefined;
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  try {
    if (START_SERVER) {
      server = startVite();
      await waitForServer(BASE_URL);
    } else {
      await waitForServer(BASE_URL, 5000);
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const context: RuntimeContext = { baseUrl: BASE_URL, consoleErrors, pageErrors };
    const results: ModuleResult[] = [];
    for (const module of modules) {
      results.push(await runModule(module, page, context));
    }

    const findings = results.flatMap((item) => item.findings);
    const report = {
      name: 'No Man Left Behind App Audit',
      status: results.some((item) => item.status === 'fail') ? 'fail' : results.some((item) => item.status === 'warn') ? 'warn' : 'pass',
      score: results.length ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length) : 0,
      baseUrl: BASE_URL,
      startedAt: new Date().toISOString(),
      totals: {
        modules: results.length,
        findings: findings.length,
        critical: findings.filter((item) => item.severity === 'critical').length,
        error: findings.filter((item) => item.severity === 'error').length,
        warning: findings.filter((item) => item.severity === 'warning').length,
        info: findings.filter((item) => item.severity === 'info').length,
      },
      results,
    };

    await writeFile(OUT_PATH, JSON.stringify(report, null, 2));
    console.log('\nNO MAN LEFT BEHIND AUDIT');
    console.log(`Status: ${report.status}`);
    console.log(`Score: ${report.score}`);
    console.log(`Report: ${OUT_PATH}`);
    for (const result of results) {
      console.log(`- ${result.status.toUpperCase()} ${result.name}: ${result.score}`);
      for (const finding of result.findings) {
        console.log(`  [${finding.severity}] ${finding.title} — ${finding.message}`);
      }
    }

    if (report.status === 'fail') process.exit(1);
  } finally {
    await browser?.close().catch(() => undefined);
    if (server) server.kill('SIGTERM');
  }
}

main().catch(async (error) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const message = error instanceof Error ? error.message : String(error);
  await writeFile(OUT_PATH, JSON.stringify({
    name: 'No Man Left Behind App Audit',
    status: 'fail',
    score: 0,
    fatal: message,
    fix: message.includes('browserType.launch') || message.includes('Executable')
      ? 'Run: npx playwright install chromium'
      : 'Fix the fatal audit startup error, then rerun npm run audit:no-man-left-behind.',
  }, null, 2));
  console.error(message);
  process.exit(1);
});

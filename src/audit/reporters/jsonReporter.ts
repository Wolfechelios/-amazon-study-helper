import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AuditRunReport } from '../types';

export async function writeJsonReport(report: AuditRunReport, outputPath: string): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
}

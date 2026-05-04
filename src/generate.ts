import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadConfig } from './config.js';
import { buildChecklist, renderReadme } from './render.js';
import type { GenerateOptions, RenderResult } from './types.js';
import { validateConfig } from './validate.js';

export async function generateFromConfig(configPath: string, outputPath: string, options: GenerateOptions = {}): Promise<RenderResult> {
  const cwd = options.cwd ?? process.cwd();
  const validationMode = options.validationMode ?? 'safe';
  const config = await loadConfig(configPath, cwd);
  const validation = await validateConfig(config, cwd, validationMode);
  const checklist = buildChecklist(config, validation);
  const readme = renderReadme(config, validation);
  const fullOutputPath = resolve(cwd, outputPath);

  await mkdir(dirname(fullOutputPath), { recursive: true });
  await writeFile(fullOutputPath, readme, 'utf8');

  return { readme, checklist, validation };
}

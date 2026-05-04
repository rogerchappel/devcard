import type { ChecklistItem, DevcardConfig, ValidationReport } from './types.js';
export declare function buildChecklist(config: DevcardConfig, validation: ValidationReport): ChecklistItem[];
export declare function renderReadme(config: DevcardConfig, validation: ValidationReport): string;

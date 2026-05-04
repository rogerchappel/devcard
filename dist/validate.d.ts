import type { DevcardConfig, ValidationReport } from './types.js';
export declare function validateConfig(config: DevcardConfig, cwd: string, mode: 'none' | 'safe'): Promise<ValidationReport>;

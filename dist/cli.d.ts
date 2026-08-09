import type { LinkValidationMode } from './types.js';
export interface CliOptions {
    config: string;
    output: string;
    validationMode: LinkValidationMode;
    cwd: string;
}
export interface CliIo {
    stdout: Pick<NodeJS.WriteStream, 'write'>;
    stderr: Pick<NodeJS.WriteStream, 'write'>;
}
export declare function printHelp(): string;
export declare function parseArgs(argv: string[], cwd?: string): CliOptions;
export declare function runCli(argv: string[], cwd?: string, io?: CliIo): Promise<number>;

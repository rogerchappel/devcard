import { generateFromConfig } from './generate.js';
export function printHelp() {
    return `devcard\n\nUsage:\n  devcard generate --config ./devcard.json --output ./README.generated.md [--validate safe|none]\n\nNotes:\n  - Local-first: reads JSON config from disk and writes Markdown locally.\n  - Explicit validation only: safe mode checks local file existence and warns on non-HTTPS links.\n  - No hidden network calls or publishing.\n`;
}
export function parseArgs(argv, cwd = process.cwd()) {
    if (argv[0] !== 'generate') {
        throw new Error(`Unknown command: ${argv[0]}\n\n${printHelp()}`);
    }
    let config = './devcard.json';
    let output = './README.generated.md';
    let validationMode = 'safe';
    for (let index = 1; index < argv.length; index += 1) {
        const token = argv[index];
        const next = argv[index + 1];
        if (token === '--config' && next) {
            config = next;
            index += 1;
        }
        else if (token === '--output' && next) {
            output = next;
            index += 1;
        }
        else if (token === '--validate' && next && (next === 'safe' || next === 'none')) {
            validationMode = next;
            index += 1;
        }
        else {
            throw new Error(`Unsupported argument: ${token}\n\n${printHelp()}`);
        }
    }
    return {
        config,
        output,
        validationMode,
        cwd,
    };
}
export async function runCli(argv, cwd = process.cwd(), io = { stdout: process.stdout, stderr: process.stderr }) {
    if (argv.length === 0 || argv.includes('--help')) {
        io.stdout.write(printHelp());
        return 0;
    }
    try {
        const options = parseArgs(argv, cwd);
        const result = await generateFromConfig(options.config, options.output, {
            cwd,
            validationMode: options.validationMode,
        });
        io.stdout.write(`Generated ${options.output}\n`);
        io.stdout.write(`Validation findings: ${result.validation.findings.length}\n`);
        return result.validation.findings.some((finding) => finding.level === 'error') ? 2 : 0;
    }
    catch (error) {
        io.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        return 1;
    }
}

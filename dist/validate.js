import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const HTTPS_URL = /^https:\/\/.+/i;
const HTTP_URL = /^https?:\/\/.+/i;
const MAILTO_URL = /^mailto:.+/i;
function pushIfMissing(findings, value, message) {
    if (!value) {
        findings.push({ level: 'warning', kind: 'config', message });
    }
}
async function validateTarget(target, cwd, findings) {
    if (HTTP_URL.test(target) || MAILTO_URL.test(target)) {
        if (!HTTPS_URL.test(target) && !MAILTO_URL.test(target)) {
            findings.push({
                level: 'warning',
                kind: 'link',
                message: 'Prefer HTTPS links when possible.',
                target,
            });
        }
        return;
    }
    const resolved = resolve(cwd, target);
    try {
        await access(resolved);
        const stats = await stat(resolved);
        if (!stats.isFile()) {
            findings.push({ level: 'error', kind: 'image', message: 'Local asset path is not a file.', target });
        }
    }
    catch {
        findings.push({ level: 'error', kind: 'image', message: 'Local asset path does not exist.', target });
    }
}
export async function validateConfig(config, cwd, mode) {
    const findings = [];
    const { profile } = config;
    pushIfMissing(findings, profile.website, 'Profile website is optional, but recommended for a public card.');
    pushIfMissing(findings, profile.location, 'Profile location is optional, but helps readers place your context.');
    if (mode === 'none') {
        return { mode, findings };
    }
    const urls = [
        profile.website,
        profile.email ? `mailto:${profile.email}` : undefined,
        ...(profile.links?.map((link) => link.url) ?? []),
        ...(profile.writing?.map((link) => link.url) ?? []),
        ...(profile.projects?.flatMap((project) => [project.repo]) ?? []),
    ].filter((value) => Boolean(value));
    for (const url of urls) {
        await validateTarget(url, cwd, findings);
    }
    return { mode, findings };
}

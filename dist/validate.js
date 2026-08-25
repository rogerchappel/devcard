import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
function pushIfMissing(findings, value, message) {
    if (!value) {
        findings.push({ level: 'warning', kind: 'config', message });
    }
}
function validateWebTarget(target, field, findings) {
    let url;
    try {
        url = new URL(target);
    }
    catch {
        findings.push({ level: 'error', kind: 'link', message: `Invalid ${field} URL. Use a complete HTTP or HTTPS URL.`, target });
        return;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        findings.push({ level: 'error', kind: 'link', message: `Unsupported ${field} URL scheme. Use HTTP or HTTPS.`, target });
        return;
    }
    if (!url.hostname) {
        findings.push({ level: 'error', kind: 'link', message: `Invalid ${field} URL: a hostname is required.`, target });
        return;
    }
    if (url.protocol === 'http:') {
        findings.push({ level: 'warning', kind: 'link', message: `Prefer HTTPS for the ${field} when possible.`, target });
    }
}
function validateEmail(email, findings) {
    const normalized = email.toLowerCase().startsWith('mailto:') ? email.slice(7) : email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        findings.push({ level: 'error', kind: 'link', message: 'Invalid profile email. Use an address such as name@example.com (mailto: is optional).', target: email });
    }
}
async function validateLocalTarget(target, baseDir, findings) {
    const resolved = resolve(baseDir, target);
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
export async function validateConfig(config, baseDir, mode) {
    const findings = [];
    const { profile } = config;
    pushIfMissing(findings, profile.website, 'Profile website is optional, but recommended for a public card.');
    pushIfMissing(findings, profile.location, 'Profile location is optional, but helps readers place your context.');
    if (mode === 'none') {
        return { mode, findings };
    }
    if (profile.website)
        validateWebTarget(profile.website, 'website', findings);
    if (profile.email)
        validateEmail(profile.email, findings);
    for (const link of profile.links ?? []) {
        if (/^[a-z][a-z\d+.-]*:/i.test(link.url))
            validateWebTarget(link.url, 'link', findings);
        else
            await validateLocalTarget(link.url, baseDir, findings);
    }
    for (const item of profile.writing ?? []) {
        validateWebTarget(item.url, 'writing', findings);
    }
    for (const project of profile.projects ?? []) {
        if (project.repo)
            validateWebTarget(project.repo, 'project repository', findings);
    }
    return { mode, findings };
}

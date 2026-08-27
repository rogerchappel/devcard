import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
function assertKnownKeys(value, allowed, path = '') {
    const allowedKeys = new Set(allowed);
    const unknownKey = Object.keys(value).find((key) => !allowedKeys.has(key));
    if (unknownKey) {
        throw new Error(`Unknown config key: ${path}${unknownKey}.`);
    }
}
function assertString(value, label) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Expected ${label} to be a non-empty string.`);
    }
    return value.trim();
}
function optionalString(value) {
    if (value == null || value === '') {
        return undefined;
    }
    return assertString(value, 'string');
}
function optionalStringArray(value, label) {
    if (value == null) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new Error(`Expected ${label} to be an array of strings.`);
    }
    return value.map((item, index) => assertString(item, `${label}[${index}]`));
}
function optionalBoolean(value, label, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    if (typeof value !== 'boolean') {
        throw new Error(`Expected ${label} to be a boolean.`);
    }
    return value;
}
function parseProjects(value) {
    if (value == null) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new Error('Expected profile.projects to be an array.');
    }
    return value.map((entry, index) => {
        if (!entry || typeof entry !== 'object') {
            throw new Error(`Expected profile.projects[${index}] to be an object.`);
        }
        const project = entry;
        assertKnownKeys(project, ['name', 'description', 'repo', 'highlights', 'status'], `profile.projects[${index}].`);
        const status = project.status;
        if (status !== undefined && (typeof status !== 'string' || !['active', 'maintained', 'paused', 'experimental'].includes(status))) {
            throw new Error(`Unsupported project status at profile.projects[${index}].status`);
        }
        return {
            name: assertString(project.name, `profile.projects[${index}].name`),
            description: assertString(project.description, `profile.projects[${index}].description`),
            repo: optionalString(project.repo),
            highlights: optionalStringArray(project.highlights, `profile.projects[${index}].highlights`),
            status: status,
        };
    });
}
function parseLinkCollection(value, label) {
    if (value == null) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new Error(`Expected ${label} to be an array.`);
    }
    return value.map((entry, index) => {
        if (!entry || typeof entry !== 'object') {
            throw new Error(`Expected ${label}[${index}] to be an object.`);
        }
        const item = entry;
        assertKnownKeys(item, ['label', 'url'], `${label}[${index}].`);
        return {
            label: assertString(item.label, `${label}[${index}].label`),
            url: assertString(item.url, `${label}[${index}].url`),
        };
    });
}
function parseWritingCollection(value, label) {
    if (value == null) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new Error(`Expected ${label} to be an array.`);
    }
    return value.map((entry, index) => {
        if (!entry || typeof entry !== 'object') {
            throw new Error(`Expected ${label}[${index}] to be an object.`);
        }
        const item = entry;
        assertKnownKeys(item, ['title', 'label', 'url'], `${label}[${index}].`);
        return {
            title: assertString(item.title ?? item.label, `${label}[${index}].title`),
            url: assertString(item.url, `${label}[${index}].url`),
        };
    });
}
function withOptional(target, key, value) {
    if (value === undefined) {
        return target;
    }
    return { ...target, [key]: value };
}
function parseProfile(value) {
    if (!value || typeof value !== 'object') {
        throw new Error('Expected profile to be an object.');
    }
    const profile = value;
    assertKnownKeys(profile, [
        'name', 'tagline', 'location', 'pronouns', 'website', 'email', 'focus', 'now',
        'stack', 'links', 'projects', 'writing', 'notes',
    ], 'profile.');
    let result = {
        name: assertString(profile.name, 'profile.name'),
        tagline: assertString(profile.tagline, 'profile.tagline'),
    };
    result = withOptional(result, 'location', optionalString(profile.location));
    result = withOptional(result, 'pronouns', optionalString(profile.pronouns));
    result = withOptional(result, 'website', optionalString(profile.website));
    result = withOptional(result, 'email', optionalString(profile.email));
    result = withOptional(result, 'focus', optionalStringArray(profile.focus, 'profile.focus'));
    result = withOptional(result, 'now', optionalStringArray(profile.now, 'profile.now'));
    result = withOptional(result, 'stack', optionalStringArray(profile.stack, 'profile.stack'));
    result = withOptional(result, 'links', parseLinkCollection(profile.links, 'profile.links'));
    result = withOptional(result, 'projects', parseProjects(profile.projects));
    result = withOptional(result, 'writing', parseWritingCollection(profile.writing, 'profile.writing'));
    result = withOptional(result, 'notes', optionalStringArray(profile.notes, 'profile.notes'));
    return result;
}
export async function loadConfig(configPath, cwd = process.cwd()) {
    const fullPath = resolve(cwd, configPath);
    const raw = await readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Expected config to be an object.');
    }
    const root = parsed;
    assertKnownKeys(root, ['profile', 'options']);
    const config = {
        profile: parseProfile(root.profile),
    };
    if (root.options != null) {
        if (typeof root.options !== 'object' || Array.isArray(root.options)) {
            throw new Error('Expected options to be an object.');
        }
        const options = root.options;
        assertKnownKeys(options, ['includeChecklist', 'includeValidationSummary'], 'options.');
        config.options = {
            includeChecklist: optionalBoolean(options.includeChecklist, 'options.includeChecklist', true),
            includeValidationSummary: optionalBoolean(options.includeValidationSummary, 'options.includeValidationSummary', true),
        };
    }
    return config;
}

import type { ChecklistItem, DevcardConfig, DevcardProfile, ValidationReport } from './types.js';

function renderList(title: string, values?: string[]): string {
  if (!values?.length) {
    return '';
  }
  return `## ${title}\n\n${values.map((value) => `- ${value}`).join('\n')}\n`;
}

function renderLinks(profile: DevcardProfile): string {
  const links = [
    profile.website ? { label: 'Website', url: profile.website } : undefined,
    ...(profile.links ?? []),
  ].filter((entry): entry is { label: string; url: string } => Boolean(entry));

  if (!links.length) {
    return '';
  }

  return `## Links\n\n${links.map((link) => `- [${link.label}](${link.url})`).join('\n')}\n`;
}

function renderProjects(profile: DevcardProfile): string {
  if (!profile.projects?.length) {
    return '';
  }

  const items = profile.projects
    .map((project) => {
      const header = project.repo ? `### [${project.name}](${project.repo})` : `### ${project.name}`;
      const details = [project.description];
      if (project.status) {
        details.push(`Status: ${project.status}`);
      }
      if (project.highlights?.length) {
        details.push(project.highlights.map((item) => `- ${item}`).join('\n'));
      }
      return `${header}\n\n${details.join('\n\n')}`;
    })
    .join('\n\n');

  return `## Projects\n\n${items}\n`;
}

function renderWriting(profile: DevcardProfile): string {
  if (!profile.writing?.length) {
    return '';
  }
  return `## Writing\n\n${profile.writing.map((item) => `- [${item.title}](${item.url})`).join('\n')}\n`;
}

function renderNotes(profile: DevcardProfile): string {
  if (!profile.notes?.length) {
    return '';
  }
  return `## Notes\n\n${profile.notes.map((note) => `> ${note}`).join('\n> ')}\n`;
}

export function buildChecklist(config: DevcardConfig, validation: ValidationReport): ChecklistItem[] {
  const profile = config.profile;
  return [
    {
      title: 'Review headline',
      done: profile.tagline.length > 12,
      reason: 'Short taglines tend to drift; confirm the current positioning still feels true.',
    },
    {
      title: 'Refresh active projects',
      done: Boolean(profile.projects?.length),
      reason: 'Readers care most about what is current and real.',
    },
    {
      title: 'Check validation warnings',
      done: !validation.findings.some((finding) => finding.level !== 'info'),
      reason: 'Broken links or local-only references make the card rot quickly.',
    },
    {
      title: 'Re-run after notable work',
      done: false,
      reason: 'Keep the README in sync when your focus or projects change.',
    },
  ];
}

function renderValidation(validation: ValidationReport): string {
  if (!validation.findings.length) {
    return '## Validation\n\n- No findings in the selected validation mode.\n';
  }

  return `## Validation\n\n${validation.findings
    .map((finding) => `- **${finding.level}** ${finding.message}${finding.target ? ` (${finding.target})` : ''}`)
    .join('\n')}\n`;
}

function renderChecklist(checklist: ChecklistItem[]): string {
  return `## Update checklist\n\n${checklist.map((item) => `- [${item.done ? 'x' : ' '}] ${item.title} — ${item.reason}`).join('\n')}\n`;
}

export function renderReadme(config: DevcardConfig, validation: ValidationReport): string {
  const profile = config.profile;
  const introBits = [profile.location, profile.pronouns].filter(Boolean).join(' · ');
  const header = `# ${profile.name}\n\n${profile.tagline}\n\n${introBits ? `${introBits}\n\n` : ''}`;
  const sections = [
    renderList('Focus', profile.focus),
    renderList('Now', profile.now),
    renderList('Stack', profile.stack),
    renderLinks(profile),
    renderProjects(profile),
    renderWriting(profile),
    renderNotes(profile),
    config.options?.includeValidationSummary === false ? '' : renderValidation(validation),
    config.options?.includeChecklist === false ? '' : renderChecklist(buildChecklist(config, validation)),
  ].filter(Boolean);

  return `${header}${sections.join('\n')}`.trimEnd() + '\n';
}

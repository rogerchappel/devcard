export type LinkValidationMode = 'none' | 'safe';

export interface DevcardProject {
  name: string;
  description: string;
  repo?: string | undefined;
  highlights?: string[] | undefined;
  status?: 'active' | 'maintained' | 'paused' | 'experimental' | undefined;
}

export interface DevcardLink {
  label: string;
  url: string;
}

export interface DevcardWriting {
  title: string;
  url: string;
}

export interface DevcardProfile {
  name: string;
  tagline: string;
  location?: string | undefined;
  pronouns?: string | undefined;
  website?: string | undefined;
  email?: string | undefined;
  focus?: string[] | undefined;
  now?: string[] | undefined;
  stack?: string[] | undefined;
  links?: DevcardLink[] | undefined;
  projects?: DevcardProject[] | undefined;
  writing?: DevcardWriting[] | undefined;
  notes?: string[] | undefined;
}

export interface DevcardConfig {
  profile: DevcardProfile;
  options?: {
    includeChecklist?: boolean | undefined;
    includeValidationSummary?: boolean | undefined;
  } | undefined;
}

export interface ValidationFinding {
  level: 'info' | 'warning' | 'error';
  kind: 'link' | 'image' | 'config';
  message: string;
  target?: string;
}

export interface ValidationReport {
  mode: LinkValidationMode;
  findings: ValidationFinding[];
}

export interface ChecklistItem {
  title: string;
  done: boolean;
  reason: string;
}

export interface RenderResult {
  readme: string;
  checklist: ChecklistItem[];
  validation: ValidationReport;
}

export interface GenerateOptions {
  cwd?: string;
  validationBase?: string;
  validationMode?: LinkValidationMode;
}

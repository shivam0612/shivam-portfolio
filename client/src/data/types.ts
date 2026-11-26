export type ProjectStatus = 'Concept' | 'In Progress' | 'Completed';

export interface NavItem {
  label: string;
  to: string;
  /** id of the matching home-page section, used for scroll-spy on "/". */
  section: string;
}

export interface ExperienceEntry {
  id: string;
  employer: string;
  /** Shown in brackets after the employer, e.g. "(DHL Supply Chain)". */
  employerNote?: string;
  title: string;
  /** Dates exactly as written on the resume. */
  dates: string;
  /** Machine-readable range used only by the career chart. `end: null` means "Present". */
  range: { start: string; end: string | null };
  responsibilities: string[];
  skills: string[];
  technology: string[];
}

export interface Skill {
  name: string;
  /** What the resume says that supports this skill. No ratings or percentages. */
  evidence: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  icon: 'warehouse' | 'shield' | 'users' | 'cpu' | 'workflow';
  description: string;
  skills: Skill[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issuerLabel: 'Issuer' | 'Provider';
  note?: string;
  /** Displayed expiry date, or 'No expiry' when the credential does not expire. */
  expiry?: string;
  /** Only set when an authentic, verifiable URL has been provided. */
  credentialUrl: string | null;
}

export type IllustrationKind = 'dashboard' | 'inventory' | 'workflow' | 'lab';

export interface Project {
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  summary: string;
  features: string[];
  /** Planned/proposed technologies. These are NOT claims of completed work. */
  stack: string[];
  illustration: IllustrationKind;
  problem: string;
  users: string[];
  workflow: string[];
  architecture: { summary: string; layers: { name: string; detail: string }[] };
  implementationStatus: string;
  screenshots: { src: string; alt: string }[];
  limitations: string[];
  futureImprovements: string[];
  repoUrl: string | null;
  liveUrl: string | null;
}

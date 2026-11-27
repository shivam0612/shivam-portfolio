import { describe, expect, it } from 'vitest';
import { certifications } from '../data/certifications';
import { education } from '../data/education';
import { experience } from '../data/experience';
import { opsTechFlow } from '../data/flow';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillCategories } from '../data/skills';

/** Guards that fail if unverified or invented information is ever added. */
describe('resume fidelity', () => {
  it('lists professional experience in the requested order with supplied dates', () => {
    expect(experience.map((e) => [e.employer, e.title, e.dates])).toEqual([
      ['Lambton College', 'Software Engineering Team Lead', 'May 2023 – August 2023'],
      ['Matrix Logistics Services', 'Team Member', 'August 2022 – November 2026'],
      [
        'Bell Canada',
        'Team Leader / Sales Supervisor and Sales Associate',
        'February 2022 – June 2024',
      ],
      ['Verzeo', 'Web Development Intern', 'March 2021 – August 2021'],
      ['Verzeo', 'Artificial Intelligence Intern', 'October 2020 – December 2020'],
    ]);
  });

  it('keeps role-specific details', () => {
    expect(experience[1]!.employerNote).toBe('DHL Supply Chain');
    expect(experience[1]!.responsibilities).toHaveLength(5);
    expect(experience[1]!.technology).toEqual(['DALLAS']);
    expect(experience[2]!.technology).toEqual(['Salesforce', 'Microsoft Office']);
    expect(experience[0]!.responsibilities).toHaveLength(5);
  });
  it('lists education exactly as provided', () => {
    expect(education).toEqual([
      {
        degree: 'Postgraduate Degree in Computer Science',
        institution: 'Lambton College, Mississauga',
        year: '2023',
      },
      {
        degree: 'Bachelor of Computer Science & Engineering',
        institution: 'Parul University',
        year: '2017',
      },
      {
        degree: 'Diploma in Computer Science & Engineering',
        institution: 'Parul University',
        year: '2014',
      },
    ]);
  });

  it('lists the three certifications without invented credential links or IDs', () => {
    expect(certifications.map((c) => c.name)).toEqual([
      'AWS Certified Solutions Architect – Associate',
      'AWS Certified Cloud Practitioner – Foundational',
      'Certified Supply Chain Specialist (CSCS)',
    ]);
    expect(certifications.map((c) => c.expiry)).toEqual(['05/2027', '05/2027', 'No expiry']);
    expect(certifications.every((c) => c.credentialUrl === null)).toBe(true);
    expect(JSON.stringify(certifications)).not.toMatch(/credential id|https?:\/\//i);
  });

  it('uses the supplied contact details', () => {
    expect(profile.contact.email).toBe('Shivampatel868@yahoo.com');
    expect(profile.contact.phone).toBe('+1 647-877-3709');
    expect(profile.contact.phoneHref).toBe('tel:+16478773709');
    expect(profile.contact.phoneIndia).toBe('+91 7359003709');
    expect(profile.contact.phoneIndiaHref).toBe('tel:+917359003709');
  });

  it('hides everything that was not provided by default', () => {
    expect(profile.social.linkedin).toBe('https://www.linkedin.com/in/shivampatel6/');
    expect(profile.social.github).toBe('https://github.com/shivam0612');
    expect(profile.location).toBeNull();
    expect(profile.availability.show).toBe(false);
    expect(profile.resumeUrl).toBe('');
  });

  it('preserves the professional summary', () => {
    const full = profile.summaryFull.join(' ');
    for (const phrase of [
      'over four years',
      'DC30 processes',
      'Replenishment, Shorts resolution, and Selection',
      'train and support new associates',
      'KPI performance',
    ]) {
      expect(full).toContain(phrase);
    }
  });
});

describe('no fabricated metrics', () => {
  it('skills carry evidence, never ratings or percentages', () => {
    for (const cat of skillCategories) {
      for (const skill of cat.skills) {
        expect(Object.keys(skill).sort()).toEqual(['evidence', 'name']);
      }
    }
    expect(skillCategories).toHaveLength(5);
  });

  it('contains exactly the competencies requested', () => {
    const names = skillCategories.flatMap((c) => c.skills.map((s) => s.name));
    for (const n of [
      'DC30 Warehouse Operations',
      'Cherry Picker Operation',
      'Training New Associates',
      'DALLAS Warehouse Software',
      'Microsoft Project',
      'Continuous Improvement',
    ]) {
      expect(names).toContain(n);
    }
    expect(names).toHaveLength(7 + 6 + 6 + 8 + 6);
  });

  it('does not include removed Nestle or Kellogg employment', () => {
    expect(JSON.stringify(experience)).not.toMatch(/Nestl[eé]|Kellogg/i);
  });
});

describe('project integrity', () => {
  it('every project is an honest concept with no invented links, outcomes or screenshots', () => {
    expect(projects).toHaveLength(4);
    for (const p of projects) {
      expect(p.status).toBe('Concept');
      expect(p.repoUrl).toBeNull();
      expect(p.liveUrl).toBeNull();
      expect(p.screenshots).toEqual([]);
      expect(p.implementationStatus).toMatch(/^Concept/);
    }
    expect(new Set(projects.map((p) => p.slug)).size).toBe(4);
  });

  it('project copy does not claim results', () => {
    const text = JSON.stringify(projects).toLowerCase();
    const claims = [
      /\breduced\b/,
      /\bincreased\b/,
      /\bsaved (time|money|cost)/,
      /improved by/,
      /\bdeployed\b/,
      /in production/,
      /\d+\s?%/,
      /\bcustomers? (use|rely)/,
    ];
    for (const claim of claims) expect(text).not.toMatch(claim);
  });
});

describe('operations + technology explorer', () => {
  it('has the six requested steps, each separating real experience from illustrative ideas', () => {
    expect(opsTechFlow.map((n) => n.label)).toEqual([
      'Warehouse Operations',
      'Inventory Management',
      'Order Processing',
      'Business Systems',
      'Data and Reporting',
      'Process Improvement',
    ]);
    for (const n of opsTechFlow) {
      expect(n.experience.length).toBeGreaterThan(0);
      expect(n.illustrative.length).toBeGreaterThan(10);
      expect(n.what && n.why && n.relation).toBeTruthy();
    }
    const business = opsTechFlow.find((n) => n.id === 'business-systems')!;
    expect(business.experience[0]).toBe(
      'Experience using DALLAS, Microsoft Office, Microsoft Project, Salesforce, and Google Docs.',
    );
    expect(business.experienceNote).toMatch(/not a claim of software development experience/);
  });
});

import type { Certification } from './types';

/**
 * Listed exactly as on the resume. `credentialUrl` stays null until an authentic, verifiable
 * link is supplied — no credential IDs or verification URLs are invented.
 */
export const certifications: Certification[] = [
  {
    name: 'Certified Supply Chain Specialist (CSCS)',
    issuer: 'DHL Supply Chain / Matrix Logistics Services',
    issuerLabel: 'Issuer',
    credentialUrl: null,
  },
  {
    name: 'Diploma in Operations Management',
    issuer: 'Alison',
    issuerLabel: 'Provider',
    note: 'CPD Accredited (as described on the resume)',
    credentialUrl: null,
  },
  {
    name: 'Leadership and Supervisory Skills',
    issuer: 'Cloud Assess',
    issuerLabel: 'Provider',
    credentialUrl: null,
  },
];

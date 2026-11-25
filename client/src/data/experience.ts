import type { ExperienceEntry } from './types';

/**
 * Employment history exactly as provided on the resume. Dates are displayed verbatim.
 * The three date ranges overlap on the resume; they are shown as written, without interpretation.
 */
export const experience: ExperienceEntry[] = [
  {
    id: 'matrix-logistics',
    employer: 'Matrix Logistics Services',
    employerNote: 'DHL Supply Chain',
    title: 'Team Member',
    dates: 'August 2022 – Present',
    range: { start: '2022-08', end: null },
    responsibilities: [
      'Ensure accurate and efficient fulfillment of customer orders while maintaining quality and safety standards.',
      'Apply DC30 process knowledge across Replenishment, Shorts resolution, and Selection.',
      'Identify and correct mispicks and selection errors.',
      'Operate warehouse equipment, including pallet jacks, cherry pickers, and Reach Trucks, safely and efficiently.',
      'Support onboarding and training of new associates.',
      'Help associates build productivity while promoting safety protocols and operational excellence.',
      'Manage shorts and inventory control processes using DALLAS software.',
      'Maintain documentation for audits, compliance, and inventory tracking.',
      'Work across multiple warehouse functions to support operational productivity.',
      'Contribute to process efficiency and adapt to systems and technologies through teamwork and technical aptitude.',
      'Recognized in performance reviews for attendance, productivity, and operational knowledge.',
    ],
    skills: [
      'DC30 Operations',
      'Replenishment',
      'Shorts Resolution',
      'Selection',
      'Inventory Control',
      'Reach Truck',
      'Pallet Jack',
      'Cherry Picker',
      'Training New Associates',
      'Safety Compliance',
      'Documentation',
    ],
    technology: ['DALLAS'],
  },
  {
    id: 'bell-canada',
    employer: 'Bell Canada',
    title: 'Sales Associate / Team Support',
    dates: 'February 2022 – June 2024',
    range: { start: '2022-02', end: '2024-06' },
    responsibilities: [
      'Help customers identify suitable products and services.',
      'Guide and support a team of approximately four to five associates on customer engagement and sales strategies.',
      'Contribute to achieving sales targets through communication, coaching, and customer relationship management.',
      'Maintain customer and sales records using Microsoft Office, Google Docs, and Salesforce.',
    ],
    skills: [
      'Customer Communication',
      'Team Support',
      'Coaching',
      'Customer Relationship Management',
      'Record Keeping',
    ],
    technology: ['Microsoft Office', 'Google Docs', 'Salesforce'],
  },
  {
    id: 'nestle-kellogg',
    employer: 'Nestlé / Kellogg',
    title: 'Warehouse Associate',
    dates: 'December 2021 – September 2022',
    range: { start: '2021-12', end: '2022-09' },
    responsibilities: [
      'Achieved 99% accuracy in inventory management and order processing, as reported in the resume.',
      'Collaborated with team members to improve warehouse productivity and workflow efficiency.',
      'Maintained clean and organized warehouse environments while following safety standards.',
    ],
    skills: [
      'Inventory Accuracy',
      'Order Processing',
      'Workflow Efficiency',
      'Safety Standards',
      'Warehouse Organization',
    ],
    technology: [],
  },
];

import type { SkillCategory } from './types';

/**
 * Competencies grouped by category. There are deliberately no percentages or proficiency bars:
 * each skill carries the resume evidence that supports it instead.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'warehouse',
    label: 'Warehouse Operations',
    icon: 'warehouse',
    description: 'Day-to-day fulfillment work across the DC30 process areas.',
    skills: [
      {
        name: 'DC30 Warehouse Operations',
        evidence: 'Comprehensive working knowledge of DC30 processes (resume summary).',
      },
      {
        name: 'Replenishment',
        evidence:
          'Applied across the Matrix Logistics Services (DHL Supply Chain) Team Member role.',
      },
      {
        name: 'Shorts Resolution',
        evidence: 'Manages shorts and inventory control processes using DALLAS software.',
      },
      { name: 'Selection', evidence: 'Identifies and corrects mispicks and selection errors.' },
      {
        name: 'Order Fulfillment',
        evidence: 'Ensures accurate and efficient fulfillment of customer orders.',
      },
      {
        name: 'Inventory Control',
        evidence: 'Manages inventory control processes and tracking documentation.',
      },
      {
        name: 'Warehouse Documentation',
        evidence: 'Maintains documentation for audits, compliance, and inventory tracking.',
      },
    ],
  },
  {
    id: 'equipment-safety',
    label: 'Equipment and Safety',
    icon: 'shield',
    description: 'Safe operation of material handling equipment.',
    skills: [
      {
        name: 'Reach Truck Operation',
        evidence: 'Operates Reach Trucks safely and efficiently (Matrix Logistics Services).',
      },
      {
        name: 'Pallet Jack Operation',
        evidence: 'Operates pallet jacks safely and efficiently (Matrix Logistics Services).',
      },
      {
        name: 'Cherry Picker Operation',
        evidence: 'Operates cherry pickers safely and efficiently (Matrix Logistics Services).',
      },
      {
        name: 'Material Handling Equipment',
        evidence: 'Operates warehouse equipment as part of daily fulfillment work.',
      },
      {
        name: 'Safety Compliance',
        evidence:
          'Maintains quality and safety standards; promotes safety protocols with associates.',
      },
      {
        name: 'Risk Awareness',
        evidence:
          'Safety-first equipment operation and a clean, organized work area (Nestlé / Kellogg).',
      },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership and Teamwork',
    icon: 'users',
    description: 'Supporting colleagues and communicating clearly.',
    skills: [
      {
        name: 'Training New Associates',
        evidence: 'Supports onboarding and training of new associates.',
      },
      {
        name: 'Team Support',
        evidence:
          'Helps associates build productivity while promoting safety and operational excellence.',
      },
      {
        name: 'Team Coordination',
        evidence:
          'Guided and supported a team of approximately four to five associates (Bell Canada).',
      },
      {
        name: 'Customer Communication',
        evidence: 'Helped customers identify suitable products and services (Bell Canada).',
      },
      {
        name: 'Cross-Functional Flexibility',
        evidence: 'Works across multiple warehouse functions to support productivity.',
      },
      {
        name: 'Multi-Skilling',
        evidence: 'Adapts quickly across multiple warehouse functions (resume summary).',
      },
    ],
  },
  {
    id: 'technology',
    label: 'Technology and Business Systems',
    icon: 'cpu',
    description: 'Computer science education and the business software listed on the resume.',
    skills: [
      {
        name: 'Computer Science',
        evidence:
          'Postgraduate Degree (2023), Bachelor (2017) and Diploma (2014) in Computer Science.',
      },
      {
        name: 'Microsoft Office',
        evidence: 'Used to maintain customer and sales records (Bell Canada).',
      },
      {
        name: 'Microsoft Project',
        evidence:
          'Listed among the business software on the resume; no project detail was provided.',
      },
      {
        name: 'Salesforce',
        evidence: 'Used to maintain customer and sales records (Bell Canada).',
      },
      {
        name: 'Google Docs',
        evidence: 'Used to maintain customer and sales records (Bell Canada).',
      },
      {
        name: 'DALLAS Warehouse Software',
        evidence: 'Used to manage shorts and inventory control (Matrix Logistics Services).',
      },
      {
        name: 'Digital Workflow Familiarity',
        evidence: 'Adapts to systems and technologies through teamwork and technical aptitude.',
      },
      {
        name: 'Technical Problem-Solving',
        evidence:
          'Computer science education combined with day-to-day exception handling on the warehouse floor.',
      },
    ],
  },
  {
    id: 'improvement',
    label: 'Process Improvement',
    icon: 'workflow',
    description: 'Accuracy, compliance, and steady operational improvement.',
    skills: [
      {
        name: 'Operational Efficiency',
        evidence:
          'Contributes to process efficiency; collaborated on warehouse productivity (Nestlé / Kellogg).',
      },
      {
        name: 'Inventory Accuracy',
        evidence:
          'Reported 99% accuracy in inventory management and order processing (Nestlé / Kellogg).',
      },
      {
        name: 'Problem-Solving',
        evidence: 'Identifies and corrects mispicks and resolves shorts.',
      },
      {
        name: 'Workflow Coordination',
        evidence: 'Works across multiple warehouse functions to support operational productivity.',
      },
      {
        name: 'Process Compliance',
        evidence: 'Maintains documentation for audits and compliance.',
      },
      {
        name: 'Continuous Improvement',
        evidence: 'Stated interest in continuous improvement and KPI performance (resume summary).',
      },
    ],
  },
];

export type FlowIcon = 'warehouse' | 'boxes' | 'package' | 'database' | 'chart' | 'workflow';

export interface FlowNode {
  id: string;
  label: string;
  icon: FlowIcon;
  /** Position inside the 600×400 diagram canvas (percent of width / height). */
  x: number;
  y: number;
}

/**
 * Both diagrams share one loop layout: three nodes left→right along the top, three right→left along
 * the bottom, and the last node feeds back into the first (continuous improvement).
 */
export const FLOW_POSITIONS = [
  { x: 16.5, y: 24 },
  { x: 50, y: 24 },
  { x: 83.5, y: 24 },
  { x: 83.5, y: 76 },
  { x: 50, y: 76 },
  { x: 16.5, y: 76 },
] as const;

const at = (i: number) => FLOW_POSITIONS[i]!;

export const heroFlow: (FlowNode & { role: string })[] = [
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: 'warehouse',
    ...at(0),
    role: 'Where product is received, replenished, selected and shipped.',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'boxes',
    ...at(1),
    role: 'Keeps system records aligned with physical stock.',
  },
  {
    id: 'orders',
    label: 'Order Processing',
    icon: 'package',
    ...at(2),
    role: 'Turns customer orders into accurate, shipped fulfillment.',
  },
  {
    id: 'systems',
    label: 'Data Systems',
    icon: 'database',
    ...at(3),
    role: 'Records and communicates operational information.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'chart',
    ...at(4),
    role: 'Turns records into visibility for better decisions.',
  },
  {
    id: 'optimization',
    label: 'Process Optimization',
    icon: 'workflow',
    ...at(5),
    role: 'Feeds what is learned back into how work is done.',
  },
];

export interface OpsTechNode extends FlowNode {
  what: string;
  why: string;
  relation: string;
  /** Statements taken from the resume. */
  experience: string[];
  /** A caveat shown with the experience, when one is needed. */
  experienceNote?: string;
  /** General, hypothetical ways technology can help. NOT work that has been implemented. */
  illustrative: string;
  /** Optional link to a concept project (concepts, not completed work). */
  conceptLink?: { label: string; to: string };
}

export const opsTechFlow: OpsTechNode[] = [
  {
    id: 'warehouse-operations',
    label: 'Warehouse Operations',
    icon: 'warehouse',
    ...at(0),
    what: 'The physical work of receiving, replenishing, selecting and fulfilling orders, carried out by trained people using safe equipment practices.',
    why: 'Effective training and communication help associates understand processes, follow safety requirements, and maintain productivity.',
    relation:
      'Floor execution is where order accuracy, productivity and safety performance are actually produced.',
    experience: [
      'Applying DC30 process knowledge across Replenishment, Shorts resolution, and Selection.',
      'Operating pallet jacks, cherry pickers, and Reach Trucks safely and efficiently.',
      'Supporting onboarding and training of new associates.',
    ],
    illustrative:
      'Digital task lists or visual work instructions could help new associates learn a process step by step.',
  },
  {
    id: 'inventory-management',
    label: 'Inventory Management',
    icon: 'boxes',
    ...at(1),
    what: 'Keeping inventory records aligned with what is physically in the building.',
    why: 'Accurate inventory information supports reliable fulfillment, reduces discrepancies, and improves operational visibility.',
    relation:
      'Inventory accuracy determines whether orders can be filled complete and whether shorts occur.',
    experience: [
      'Experience managing shorts and inventory control processes, maintaining operational documentation, and working with DALLAS warehouse software.',
      'Reported 99% accuracy in inventory management and order processing at Nestlé / Kellogg (as stated on the resume).',
    ],
    illustrative:
      'Exception queues and count-variance views could make discrepancies visible sooner.',
    conceptLink: {
      label: 'Warehouse Inventory Management System (concept)',
      to: '/projects/warehouse-inventory-management-system',
    },
  },
  {
    id: 'order-processing',
    label: 'Order Processing',
    icon: 'package',
    ...at(2),
    what: 'Turning customer orders into picked, verified and shipped product.',
    why: 'Order accuracy affects customer trust, rework and cost.',
    relation:
      'Selection accuracy and prompt shorts resolution decide whether an order ships complete and on time.',
    experience: [
      'Ensuring accurate and efficient fulfillment of customer orders while maintaining quality and safety standards.',
      'Identifying and correcting mispicks and selection errors.',
    ],
    illustrative: 'A live order-status view could show where exceptions are building up.',
  },
  {
    id: 'business-systems',
    label: 'Business Systems',
    icon: 'database',
    ...at(3),
    what: 'Applications that record, organize and communicate operational information.',
    why: 'Warehouse systems and business applications help record, organize, and communicate operational information.',
    relation: 'Reliable systems make information consistent between teams and shifts.',
    experience: [
      'Experience using DALLAS, Microsoft Office, Microsoft Project, Salesforce, and Google Docs.',
    ],
    experienceNote:
      'These are tools I have used. This is not a claim of software development experience with these systems.',
    illustrative:
      'Connecting systems so data is entered once could reduce manual re-keying and mismatches.',
  },
  {
    id: 'data-reporting',
    label: 'Data and Reporting',
    icon: 'chart',
    ...at(4),
    what: 'Turning operational records into information that people can act on.',
    why: 'Good reporting depends on accurate data being captured at the source.',
    relation: 'Visible KPIs help teams focus on the right problems.',
    experience: [
      'Maintaining documentation for audits, compliance, and inventory tracking.',
      'Interested in contributing to KPI performance (stated in the resume summary).',
    ],
    illustrative:
      'Operational KPI cards and filtered tables could present this information in one place.',
    conceptLink: {
      label: 'Supply Chain Operations Dashboard (concept)',
      to: '/projects/supply-chain-operations-dashboard',
    },
  },
  {
    id: 'process-improvement',
    label: 'Process Improvement',
    icon: 'workflow',
    ...at(5),
    what: 'Using what the floor and the data show to refine how work is done.',
    why: 'Small, consistent improvements add up, and they depend on team involvement.',
    relation: 'Improvement closes the loop: it feeds back into warehouse operations.',
    experience: [
      'Contributing to process efficiency and adapting to systems and technologies through teamwork and technical aptitude.',
      'Collaborating with team members to improve warehouse productivity and workflow efficiency (Nestlé / Kellogg).',
    ],
    illustrative:
      'Workflow visualizations could help teams discuss where steps wait on information.',
    conceptLink: {
      label: 'Operations Workflow Visualizer (concept)',
      to: '/projects/operations-workflow-visualizer',
    },
  },
];

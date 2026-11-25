import type { Project } from './types';

/**
 * Project catalogue. IMPORTANT: every entry below is a CONCEPT until it is actually built and
 * verified. Change `status` (and add `screenshots`, `repoUrl`, `liveUrl`) only when that is true.
 * No outcomes, metrics, users or deployments are claimed.
 */
export const projects: Project[] = [
  {
    slug: 'supply-chain-operations-dashboard',
    title: 'Supply Chain Operations Dashboard',
    category: 'Supply Chain Analytics / Frontend Concept',
    status: 'Concept',
    illustration: 'dashboard',
    summary:
      'An interactive dashboard concept designed to demonstrate how warehouse operations, inventory information, order fulfillment, and operational metrics could be presented in a unified interface.',
    features: [
      'Inventory overview',
      'Order status visualization',
      'Replenishment overview',
      'Exception tracking',
      'Operational KPI cards',
      'Filtering and sorting',
      'Responsive data tables',
    ],
    stack: ['React', 'TypeScript', 'Framer Motion', 'CSS Grid'],
    problem:
      'Operational information is often spread across separate screens and reports. This concept explores how inventory, order status, replenishment and exceptions could be read together on one screen so that a team lead can see what needs attention first.',
    users: ['Warehouse team leads', 'Operations supervisors', 'Inventory control staff'],
    workflow: [
      'Open the overview to see order, inventory and replenishment status together.',
      'Filter by process area or exception type.',
      'Open an exception row to see the related record.',
      'Sort and review tables to decide what to address first.',
    ],
    architecture: {
      summary:
        'A front-end-only concept would read sample data and render it through reusable components. Real integration would be a separate, later decision.',
      layers: [
        {
          name: 'Presentation',
          detail: 'KPI cards, charts and responsive tables built from reusable components.',
        },
        { name: 'State', detail: 'Filtering and sorting held in client state.' },
        {
          name: 'Data',
          detail: 'Illustrative sample data only; no live operational data is used.',
        },
      ],
    },
    implementationStatus:
      'Concept. No implementation has been built or verified yet; nothing on this page is a screenshot of a working system.',
    screenshots: [],
    limitations: [
      'Would use sample data, so it cannot reflect real operations.',
      'No authentication or role-based views are planned in the first version.',
    ],
    futureImprovements: [
      'Connect to a real data source through an API.',
      'Add saved filters and exportable views.',
    ],
    repoUrl: null,
    liveUrl: null,
  },
  {
    slug: 'warehouse-inventory-management-system',
    title: 'Warehouse Inventory Management System',
    category: 'Supply Chain / Full-Stack Application',
    status: 'Concept',
    illustration: 'inventory',
    summary:
      'A proposed inventory management application demonstrating how inventory records, stock movements, and operational exceptions could be managed through a structured web interface.',
    features: [
      'Inventory records',
      'Stock movement history',
      'Search and filtering',
      'Inventory adjustments',
      'Exception management',
      'REST API',
      'Database persistence',
    ],
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Prisma'],
    problem:
      'Accurate inventory depends on knowing what changed, when, and why. This concept explores a small, structured system where every stock movement and adjustment leaves a traceable record and exceptions are surfaced instead of buried.',
    users: ['Inventory control staff', 'Warehouse supervisors', 'Auditors reviewing stock history'],
    workflow: [
      'Record or look up an inventory item.',
      'Log stock movements and adjustments with a reason.',
      'Review the movement history for any item.',
      'Raise, review and close an exception when records and counts disagree.',
    ],
    architecture: {
      summary:
        'A conventional three-tier web application: a React interface, a REST API, and a relational database with an append-only movement history.',
      layers: [
        {
          name: 'Interface',
          detail: 'React screens for search, records, adjustments and exceptions.',
        },
        { name: 'API', detail: 'Express REST endpoints with request validation.' },
        {
          name: 'Database',
          detail: 'PostgreSQL via Prisma; movements stored as history rather than overwritten.',
        },
      ],
    },
    implementationStatus:
      'Concept. The architecture is proposed; no part of this system has been implemented or verified.',
    screenshots: [],
    limitations: [
      'Not integrated with any warehouse management system.',
      'Would not replace purpose-built warehouse software such as the systems used in industry.',
    ],
    futureImprovements: [
      'Barcode-scan input.',
      'Role-based permissions.',
      'Cycle-count workflows.',
    ],
    repoUrl: null,
    liveUrl: null,
  },
  {
    slug: 'operations-workflow-visualizer',
    title: 'Operations Workflow Visualizer',
    category: 'Operations / Process Automation',
    status: 'Concept',
    illustration: 'workflow',
    summary:
      'An interactive visualization concept showing the relationship between warehouse processes, information systems, and operational workflows.',
    features: [
      'Interactive process diagrams',
      'Workflow states',
      'Process dependencies',
      'Animated information flow',
      'Exception highlighting',
      'Operational process documentation',
    ],
    stack: ['React', 'TypeScript', 'SVG', 'Framer Motion'],
    problem:
      'New team members often learn processes in pieces. This concept explores a visual map of how work and information move between warehouse steps and systems, so dependencies and hand-offs are easier to discuss and document.',
    users: [
      'New associates being onboarded',
      'Team leads documenting a process',
      'Supervisors reviewing hand-offs',
    ],
    workflow: [
      'Select a process step on the diagram.',
      'See its inputs, outputs and the system that records it.',
      'Follow dependencies to the next step.',
      'Mark where exceptions typically occur and note the documented response.',
    ],
    architecture: {
      summary:
        'A client-side diagram driven by a plain data file describing steps, systems and connections, so a process can be edited without changing code.',
      layers: [
        { name: 'Process data', detail: 'Typed definitions of steps, dependencies and notes.' },
        {
          name: 'Diagram',
          detail: 'SVG rendering with animated flow and keyboard-accessible nodes.',
        },
        { name: 'Documentation', detail: 'Per-step descriptions shown alongside the diagram.' },
      ],
    },
    implementationStatus:
      'Concept. The interactive diagram on the home page ("Where Operations Meets Technology") is a general illustration, not an implementation of this project.',
    screenshots: [],
    limitations: ['Would describe generic processes, not any employer’s proprietary workflows.'],
    futureImprovements: [
      'Import process definitions from a file.',
      'Export diagrams for training material.',
    ],
    repoUrl: null,
    liveUrl: null,
  },
  {
    slug: 'technology-and-systems-learning-lab',
    title: 'Technology and Systems Learning Lab',
    category: 'Computer Science / Technical Learning',
    status: 'Concept',
    illustration: 'lab',
    summary:
      'A portfolio section for presenting technical experiments, computer science projects, automation exercises, and other demonstrations as they are completed.',
    features: [
      'Short write-ups of technical experiments',
      'Computer science projects',
      'Automation exercises',
      'Links to real repositories once they exist',
    ],
    stack: ['To be decided per experiment'],
    problem:
      'A place to show learning in public: small, honest write-ups of what was tried, what worked, and what did not, added only as real work is completed.',
    users: ['Recruiters and hiring managers', 'Technology-oriented employers'],
    workflow: [
      'Complete a small experiment or exercise.',
      'Write up the goal, approach and result.',
      'Add the entry here with a real repository link, if one exists.',
    ],
    architecture: {
      summary: 'Content entries stored in the same central data file as the other projects.',
      layers: [
        {
          name: 'Content',
          detail: 'One entry per experiment, with status, notes and optional links.',
        },
      ],
    },
    implementationStatus:
      'Concept. No experiments have been published yet; this entry is a placeholder for future work.',
    screenshots: [],
    limitations: ['Empty until real work is added.'],
    futureImprovements: ['Add the first completed experiment with its repository link.'],
    repoUrl: null,
    liveUrl: null,
  },
];

export const getProject = (slug: string | undefined) => projects.find((p) => p.slug === slug);

import type { Project } from './types';

/**
 * Project catalogue. The AWS-hosted portfolio deployment is a completed project described in
 * the supplied resume. The remaining entries are concepts and are labelled as such.
 */
export const projects: Project[] = [
  {
    slug: 'aws-hosted-portfolio-deployment',
    title: 'AWS-Hosted Portfolio & Deployment Automation',
    category: 'AWS Cloud / DevOps / Full-Stack',
    status: 'Completed',
    illustration: 'lab',
    summary:
      'A full-stack portfolio application deployed on AWS Lightsail, using Docker-based services, Amazon ECR, HTTPS, DNS configuration, and an automated deployment workflow.',
    features: [
      'AWS Lightsail Ubuntu 24.04 hosting',
      'Docker and Docker Compose containerization',
      'Amazon ECR image registry',
      'Caddy reverse proxy and Let’s Encrypt HTTPS',
      'Cloudflare DNS configuration',
      'PowerShell deployment automation',
      'SSH-based remote deployment',
      'Deployment health checks and rollback handling',
    ],
    stack: [
      'AWS Lightsail',
      'Amazon ECR',
      'Docker',
      'Docker Compose',
      'Linux',
      'PostgreSQL',
      'Caddy',
      'Cloudflare DNS',
      'PowerShell',
      'SSH',
      'React',
      'TypeScript',
      'Node.js',
    ],
    problem:
      'The application needed a repeatable way to build, package, publish, and deploy a full-stack website while protecting the currently running production version.',
    users: ['Portfolio visitors', 'Recruiters and hiring teams'],
    workflow: [
      'Run automated application tests and TypeScript checks.',
      'Create a production build and Docker image.',
      'Publish the image to Amazon ECR.',
      'Connect to AWS Lightsail through SSH and deploy the updated services.',
      'Run deployment health checks and use rollback handling if the release is unhealthy.',
    ],
    architecture: {
      summary:
        'A containerized full-stack application hosted on an Ubuntu AWS Lightsail instance, with Amazon ECR used as the image registry and Caddy providing reverse-proxy and HTTPS configuration.',
      layers: [
        {
          name: 'Application',
          detail: 'React and TypeScript frontend with a Node.js backend and PostgreSQL database.',
        },
        {
          name: 'Containers & Registry',
          detail:
            'Docker and Docker Compose manage services; Amazon ECR stores application images.',
        },
        {
          name: 'Cloud Hosting',
          detail: 'AWS Lightsail Ubuntu 24.04 instance hosts the deployed application.',
        },
        {
          name: 'Networking & Security',
          detail:
            'Cloudflare DNS, Caddy reverse proxy, HTTPS certificates from Let’s Encrypt, and SSH remote access.',
        },
        {
          name: 'Release Automation',
          detail:
            'PowerShell workflow automates checks, builds, image publishing, remote deployment, health checks, and rollback handling.',
        },
      ],
    },
    implementationStatus:
      'Completed personal project. The portfolio is deployed at the live website. The described infrastructure and deployment workflow are based on the project details supplied in the resume.',
    screenshots: [
      {
        src: '/images/projects/portfolio/about.webp',
        alt: 'About page: introduction, photo and professional summary',
      },
      {
        src: '/images/projects/portfolio/experience-overview.webp',
        alt: 'Experience page: employment periods chart',
      },
      {
        src: '/images/projects/portfolio/experience-timeline.webp',
        alt: 'Experience page: expandable role timeline with responsibilities and technologies',
      },
      {
        src: '/images/projects/portfolio/skills.webp',
        alt: 'Skills page: competency categories and AWS Cloud & Infrastructure skills',
      },
      {
        src: '/images/projects/portfolio/education-certifications.webp',
        alt: 'Education and certifications section',
      },
      {
        src: '/images/projects/portfolio/projects-list.webp',
        alt: 'Projects page: project cards with status labels',
      },
      {
        src: '/images/projects/portfolio/project-detail.webp',
        alt: 'Project detail page for the AWS-hosted portfolio',
      },
      {
        src: '/images/projects/portfolio/project-links.webp',
        alt: 'Project page: Live Demo and GitHub buttons',
      },
      {
        src: '/images/projects/portfolio/contact.webp',
        alt: 'Contact page: contact details and message form',
      },
    ],
    limitations: [
      'This is a personal portfolio deployment, not a multi-account enterprise cloud architecture.',
      'No claim is made of production experience with Kubernetes, Terraform, or AWS services not listed here.',
    ],
    futureImprovements: [
      'Add infrastructure-as-code when implemented.',
      'Expand automated monitoring and alerting.',
      'Document a repeatable disaster-recovery procedure.',
    ],
    coverImage: {
      src: '/images/projects/aws-portfolio-home.webp',
      alt: 'Home page of shivampatel.site, the AWS-hosted portfolio',
    },
    repoUrl: 'https://github.com/shivam0612/shivam-portfolio',
    liveUrl: 'https://shivampatel.site',
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

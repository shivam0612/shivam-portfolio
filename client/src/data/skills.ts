import type { SkillCategory } from './types';

/**
 * Skills are grouped by the direction of the portfolio. Evidence distinguishes hands-on
 * project experience, education, certifications, and professional experience.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'cloud',
    label: 'AWS Cloud & Infrastructure',
    icon: 'cpu',
    description:
      'AWS services and infrastructure used in the deployed portfolio application, backed by AWS certifications.',
    skills: [
      {
        name: 'Amazon Web Services (AWS)',
        evidence:
          'AWS Certified Solutions Architect – Associate and AWS Certified Cloud Practitioner; hands-on AWS-hosted application deployment.',
      },
      {
        name: 'AWS Lightsail',
        evidence: 'Deployed the full-stack portfolio application to an Ubuntu 24.04 instance.',
      },
      {
        name: 'Amazon ECR',
        evidence: 'Configured as the Docker image registry for application deployments.',
      },
      {
        name: 'Cloud Infrastructure',
        evidence: 'Configured and maintained the application hosting environment on AWS Lightsail.',
      },
      {
        name: 'Cloudflare DNS',
        evidence:
          'Configured DNS for domain management and secure access to the deployed application.',
      },
      { name: 'HTTPS & TLS', evidence: 'Configured Caddy with Let’s Encrypt HTTPS certificates.' },
      { name: 'AWS CLI', evidence: 'Listed in the resume under deployment and automation tools.' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps & Deployment',
    icon: 'workflow',
    description: 'Containerization, deployment automation, and production release practices.',
    skills: [
      {
        name: 'Docker',
        evidence: 'Containerized the full-stack application and its PostgreSQL database.',
      },
      {
        name: 'Docker Compose',
        evidence: 'Used to manage the application and database containers.',
      },
      {
        name: 'CI/CD Concepts',
        evidence:
          'Applied automated testing, type checks, production builds, image publishing, and remote deployment in a custom workflow.',
      },
      {
        name: 'Deployment Automation',
        evidence: 'Created a PowerShell deployment workflow launched through a BAT file.',
      },
      {
        name: 'PowerShell',
        evidence:
          'Automated application checks, builds, Docker image creation, ECR publishing, and SSH deployment.',
      },
      {
        name: 'Linux & Ubuntu',
        evidence:
          'Deployed and maintained the application on an Ubuntu 24.04 AWS Lightsail instance.',
      },
      { name: 'SSH', evidence: 'Used SSH for remote deployment to AWS Lightsail.' },
      {
        name: 'Caddy Reverse Proxy',
        evidence: 'Configured Caddy as the reverse proxy with HTTPS.',
      },
      {
        name: 'Deployment Health Checks & Rollback',
        evidence:
          'Implemented deployment health checks and rollback handling to protect the production deployment.',
      },
    ],
  },
  {
    id: 'development',
    label: 'Software & Full-Stack Development',
    icon: 'cpu',
    description:
      'Application development skills from education, internships, team projects, and the deployed portfolio.',
    skills: [
      {
        name: 'JavaScript & TypeScript',
        evidence: 'Used in full-stack development and the AWS-hosted portfolio application.',
      },
      {
        name: 'ReactJS',
        evidence: 'Developed dynamic web applications and client-facing projects.',
      },
      { name: 'Node.js', evidence: 'Built full-stack applications and RESTful APIs.' },
      {
        name: 'MERN Stack',
        evidence:
          'Architected and deployed a full-stack MERN application as Software Engineering Team Lead at Lambton College.',
      },
      {
        name: 'REST APIs',
        evidence:
          'Integrated 6–7 third-party APIs in the Lambton College project and developed RESTful applications at Verzeo.',
      },
      {
        name: 'HTML & CSS',
        evidence:
          'Delivered responsive client-facing web projects during the Verzeo Web Development Internship.',
      },
      {
        name: 'Python',
        evidence: 'Used for AI/ML projects, including a face-mask detection system.',
      },
      {
        name: 'Git & GitHub',
        evidence: 'Used for version control, collaboration, and code reviews.',
      },
      {
        name: 'Next.js',
        evidence: 'Built Portfolio 1.0 with Next.js 14 and React 18.',
      },
      {
        name: 'Tailwind CSS',
        evidence: 'Used for styling and responsive layout in Portfolio 1.0.',
      },
      {
        name: 'Framer Motion',
        evidence: 'Used for interface animation in Portfolio 1.0 and in this portfolio.',
      },
      {
        name: 'EmailJS',
        evidence: 'Used to send messages from the Portfolio 1.0 contact form.',
      },
    ],
  },
  {
    id: 'data',
    label: 'Databases & Operating Systems',
    icon: 'cpu',
    description:
      'Database technologies and operating-system fundamentals used across application projects.',
    skills: [
      {
        name: 'PostgreSQL',
        evidence: 'Used with Docker Compose for the AWS-hosted portfolio application.',
      },
      { name: 'Prisma', evidence: 'Used as the database ORM in the portfolio application.' },
      {
        name: 'MongoDB & MongoDB Atlas',
        evidence:
          'Used in full-stack web development and a data visualization dashboard at Verzeo.',
      },
      { name: 'Linux', evidence: 'Used on the Ubuntu 24.04 AWS Lightsail deployment environment.' },
      {
        name: 'DNS & Networking Fundamentals',
        evidence:
          'Configured Cloudflare DNS, HTTPS, Caddy reverse proxy, and remote SSH deployment.',
      },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI & Machine Learning',
    icon: 'cpu',
    description:
      'Academic and internship project experience in machine learning and computer vision.',
    skills: [
      {
        name: 'Artificial Neural Networks (ANN)',
        evidence: 'Completed AI/ML projects during the Verzeo internship.',
      },
      {
        name: 'Convolutional Neural Networks (CNN)',
        evidence: 'Applied in computer-vision project work.',
      },
      { name: 'Transfer Learning', evidence: 'Used to build an image-captioning model.' },
      {
        name: 'Computer Vision',
        evidence:
          'Built a Python face-mask detection system with 90% accuracy and an emotion-recognition system.',
      },
      {
        name: 'Data Visualization',
        evidence:
          'Built an interactive dashboard with MongoDB Atlas during the Verzeo Web Development Internship.',
      },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership & Professional Experience',
    icon: 'users',
    description:
      'Team leadership, customer-facing communication, reporting, and operational knowledge.',
    skills: [
      {
        name: 'Software Engineering Team Leadership',
        evidence: 'Led a team of five developers at Lambton College.',
      },
      {
        name: 'Code Reviews & Quality',
        evidence:
          'Conducted 45+ code reviews and achieved 85% unit test coverage in the Lambton College project.',
      },
      {
        name: 'Sales Team Leadership',
        evidence:
          'Led 5–6 sales associates at Bell Canada, tracking monthly targets and coaching team members.',
      },
      {
        name: 'Salesforce',
        evidence: 'Maintained customer records and sales activities at Bell Canada.',
      },
      {
        name: 'Reporting & Performance Analysis',
        evidence:
          'Prepared monthly sales reports and performance analysis for Bell Canada management.',
      },
      {
        name: 'Training & Knowledge Sharing',
        evidence:
          'Onboarded and trained new associates at Matrix Logistics Services and Bell Canada.',
      },
    ],
  },
  {
    id: 'warehouse',
    label: 'Supply Chain & Operations',
    icon: 'warehouse',
    description:
      'Additional industry experience that complements a technology and cloud engineering profile.',
    skills: [
      {
        name: 'Inventory Control',
        evidence:
          'Managed inventory, investigated shortages, and corrected mispicks using DALLAS at Matrix Logistics Services.',
      },
      {
        name: 'Warehouse Management Systems',
        evidence: 'Hands-on use of DALLAS warehouse software.',
      },
      {
        name: 'KPI Tracking',
        evidence:
          'Monitored operational accuracy and productivity KPIs at Matrix Logistics Services.',
      },
      {
        name: 'Order Fulfillment',
        evidence: 'Experience across warehouse operations and order processing.',
      },
      {
        name: 'Process Documentation',
        evidence: 'Maintained documentation for audits, compliance, and inventory tracking.',
      },
    ],
  },
];

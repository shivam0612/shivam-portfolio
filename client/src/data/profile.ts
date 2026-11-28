/**
 * Central profile configuration. Edit this file to change personal details, links and SEO copy.
 * Anything that has not been provided is `null` and the UI hides it — nothing is invented.
 */
declare const __RESUME_URL__: string;

const env = import.meta.env;

/** Accepts only absolute https URLs (blocks javascript:, data:, etc.). Empty/invalid → null. */
function httpsUrl(value: string | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}
const text = (value: string | undefined) => (value ?? '').trim() || null;

export const profile = {
  name: 'Shivam Patel',
  initials: 'SP',
  headline: 'AWS Cloud & DevOps | Software Engineering | Technical Leadership & Mentoring',
  altHeadline: 'Building, deploying & supporting cloud applications.',
  heroLabel: 'CLOUD ENGINEERING × SOFTWARE DEVELOPMENT × TECHNICAL LEADERSHIP',
  heroSupporting:
    'Computer Science graduate and AWS-certified professional focused on cloud infrastructure, DevOps, and software engineering. Hands-on experience deploying an AWS-hosted application, building full-stack software, leading teams, and helping others learn through coaching and knowledge sharing.',
  supportingStatement:
    'Computer Science graduate with postgraduate education in Computer Software Engineering, AWS Solutions Architect – Associate and Cloud Practitioner certifications, and practical experience deploying a containerized full-stack application to AWS. Combines software development, cloud deployment, automation, team leadership, coaching, and knowledge sharing across technical and professional environments.',

  /** Shorter version for the homepage. Meaning preserved from the resume summary. */
  summaryShort:
    'Computer Science graduate with a postgraduate degree in Computer Software Engineering and AWS certifications in Solutions Architecture and Cloud Practitioner fundamentals. Hands-on experience building, deploying, and maintaining an AWS-hosted full-stack application using Docker, Amazon ECR, AWS Lightsail, Linux, HTTPS, DNS, and deployment automation.',

  /** Complete resume summary, split into paragraphs for the About page. */
  summaryFull: [
    'Computer Science graduate with a postgraduate degree in Computer Software Engineering and AWS certifications in Solutions Architecture and Cloud Practitioner fundamentals. Hands-on experience building, deploying, and maintaining an AWS-hosted full-stack application using Docker, Amazon ECR, AWS Lightsail, Linux, HTTPS, DNS, and deployment automation.',
    'Technical foundation in full-stack development, REST APIs, databases, software engineering practices, and AI/ML, complemented by practical cloud infrastructure and application deployment experience.',
    'Professional experience also includes software engineering team leadership, web development, AI/ML project work, sales-team supervision at Bell Canada, and logistics operations at Matrix Logistics Services (DHL Supply Chain).',
    'Seeking opportunities across AWS Cloud Engineering, Cloud Support, DevOps, software engineering, and technical mentoring or knowledge-sharing roles, while bringing a practical understanding of business operations and team collaboration.',
  ],

  contact: {
    email: 'Shivampatel868@yahoo.com',
    phone: '+1 647-877-3709',
    phoneHref: 'tel:+16478773709',
    phoneIndia: '+91 7359003709',
    phoneIndiaHref: 'tel:+917359003709',
  },

  /**
   * Profile links. Set VITE_LINKEDIN_URL / VITE_GITHUB_URL (client/.env) to the real https URLs to show
   * them everywhere. Unset = hidden; nothing is invented.
   */
  social: {
    linkedin: httpsUrl(env.VITE_LINKEDIN_URL) ?? 'https://www.linkedin.com/in/shivampatel6/',
    github: httpsUrl(env.VITE_GITHUB_URL) ?? 'https://github.com/shivam0612',
  },

  /** Set VITE_LOCATION (e.g. "Ontario, Canada") to show it. Unset = hidden. */
  location: text(env.VITE_LOCATION),

  /** Hidden until the owner confirms. Set VITE_SHOW_AVAILABILITY=true to display the label. */
  availability: {
    show: env.VITE_SHOW_AVAILABILITY === 'true',
    label: 'Open to Professional Opportunities',
  },

  /** Empty string when no resume file exists in client/public/resume/. */
  resumeUrl: typeof __RESUME_URL__ === 'string' ? __RESUME_URL__ : '',
  resumeFilename: 'Shivam_Patel_Resume',

  seo: {
    siteName: 'Shivam Patel',
    title: 'Shivam Patel | Cloud Engineering, DevOps & Software Engineering',
    description:
      "Explore Shivam Patel's AWS cloud engineering, DevOps, software development, technical leadership, mentoring, education, certifications, and professional experience.",
    /** Public origin, e.g. https://example.com. Empty = no canonical URLs are emitted. */
    siteUrl: ((env.VITE_SITE_URL as string | undefined) ?? '').trim().replace(/\/+$/, ''),
    /** Optional absolute 1200x630 PNG/JPG for link previews (VITE_OG_IMAGE_URL). */
    ogImage: httpsUrl(env.VITE_OG_IMAGE_URL),
  },

  privacyUpdated: '13 October 2026',
} as const;

export type Profile = typeof profile;

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
  headline: 'Supply Chain & Operations | Computer Science | Technology-Driven Process Improvement',
  altHeadline: 'Bridging Supply Chain Operations and Technology.',
  heroLabel: 'SUPPLY CHAIN × TECHNOLOGY',
  heroSupporting:
    'Operations professional with a computer science background, hands-on warehouse experience, inventory control expertise, and a passion for improving operational efficiency through people, processes, and technology.',
  supportingStatement:
    'An operations professional with a computer science background, hands-on warehouse experience, inventory control expertise, team-support experience, and an interest in using technology to improve operational efficiency.',

  /** Shorter version for the homepage. Meaning preserved from the resume summary. */
  summaryShort:
    'Motivated and detail-oriented operations and supply chain professional with over four years of hands-on experience in warehouse operations, inventory control, team leadership, and customer service in fast-paced DHL Supply Chain / Matrix Logistics Services environments.',

  /** Complete resume summary, split into paragraphs for the About page. */
  summaryFull: [
    'Motivated and detail-oriented operations and supply chain professional with over four years of hands-on experience in warehouse operations, inventory control, team leadership, and customer service in fast-paced DHL Supply Chain / Matrix Logistics Services environments.',
    'Comprehensive working knowledge of DC30 processes, including Replenishment, Shorts resolution, and Selection, with a consistent record of outstanding attendance, productivity, and operational knowledge.',
    'Proven ability to train and support new associates, operate material handling equipment, and adapt quickly across multiple warehouse functions.',
    'Interested in contributing to safe, efficient warehouse operations, team development, KPI performance, and continuous improvement.',
  ],

  contact: {
    email: 'Shivampatel868@yahoo.com',
    phone: '647-877-3709',
    phoneHref: 'tel:+16478773709',
  },

  /**
   * Profile links. Set VITE_LINKEDIN_URL / VITE_GITHUB_URL (client/.env) to the real https URLs to show
   * them everywhere. Unset = hidden; nothing is invented.
   */
  social: {
    linkedin: httpsUrl(env.VITE_LINKEDIN_URL),
    github: httpsUrl(env.VITE_GITHUB_URL),
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
    title: 'Shivam Patel | Supply Chain, Operations & Technology',
    description:
      "Explore Shivam Patel's background in warehouse operations, inventory control, supply chain processes, computer science, team support, and operational improvement.",
    /** Public origin, e.g. https://example.com. Empty = no canonical URLs are emitted. */
    siteUrl: ((env.VITE_SITE_URL as string | undefined) ?? '').trim().replace(/\/+$/, ''),
    /** Optional absolute 1200x630 PNG/JPG for link previews (VITE_OG_IMAGE_URL). */
    ogImage: httpsUrl(env.VITE_OG_IMAGE_URL),
  },

  privacyUpdated: '13 October 2026',
} as const;

export type Profile = typeof profile;

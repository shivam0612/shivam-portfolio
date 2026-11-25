import type { NavItem } from './types';

/** `section` ties each item to a home-page section so the nav can follow scrolling on "/". */
export const navigation: NavItem[] = [
  { label: 'Home', to: '/', section: 'top' },
  { label: 'About', to: '/about', section: 'about' },
  { label: 'Experience', to: '/experience', section: 'experience' },
  { label: 'Projects', to: '/projects', section: 'projects' },
  { label: 'Skills', to: '/skills', section: 'skills' },
  { label: 'Contact', to: '/contact', section: 'contact' },
];

export const footerLinks = [
  ...navigation,
  { label: 'Privacy Policy', to: '/privacy', section: '' },
];

/** Home-page section ids in document order (used by the scroll-spy). */
export const homeSections = [
  'top',
  'overview',
  'about',
  'skills',
  'experience',
  'ops-tech',
  'projects',
  'education',
  'contact',
] as const;

/** Which nav item should be highlighted while each home-page section is in view. */
export const sectionToNav: Record<string, string> = {
  top: '/',
  overview: '/',
  about: '/about',
  skills: '/skills',
  experience: '/experience',
  'ops-tech': '/experience',
  projects: '/projects',
  education: '/about',
  contact: '/contact',
};

import { useEffect } from 'react';
import { profile } from '../data/profile';

interface SeoOptions {
  /** Page title without the site suffix; omit for the home page. */
  title?: string;
  description?: string;
  /** Route path, e.g. "/about". Used for the canonical URL when a site URL is configured. */
  path: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

function upsert(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  set(el);
}

const meta = (attr: 'name' | 'property', key: string, content: string) =>
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(attr, key);
      return el;
    },
    (el) => el.setAttribute('content', content),
  );

/** Applies page-specific head tags. Canonical/og:url are only emitted when VITE_SITE_URL is set. */
export function applySeo({ title, description, path, noindex, jsonLd }: SeoOptions) {
  const fullTitle = title ? `${title} | ${profile.seo.siteName}` : profile.seo.title;
  const desc = description ?? profile.seo.description;
  document.title = fullTitle;
  meta('name', 'description', desc);
  meta('property', 'og:title', fullTitle);
  meta('property', 'og:description', desc);
  meta('name', 'twitter:title', fullTitle);
  meta('name', 'twitter:description', desc);
  meta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

  const { siteUrl } = profile.seo;
  if (siteUrl) {
    const url = `${siteUrl}${path === '/' ? '/' : path}`;
    upsert(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      },
      (el) => el.setAttribute('href', url),
    );
    meta('property', 'og:url', url);
  }

  const existing = document.head.querySelector('script[data-seo-jsonld]');
  if (jsonLd) {
    const el = existing ?? document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-jsonld', '');
    el.textContent = JSON.stringify(jsonLd);
    if (!existing) document.head.appendChild(el);
  } else {
    existing?.remove();
  }
}

export function useSeo(options: SeoOptions) {
  const { title, description, path, noindex } = options;
  const jsonLd = JSON.stringify(options.jsonLd ?? null);
  useEffect(() => {
    applySeo({ title, description, path, noindex, jsonLd: JSON.parse(jsonLd) ?? undefined });
  }, [title, description, path, noindex, jsonLd]);
}

/** schema.org Person. Only includes profile links that have actually been configured. */
export function personJsonLd() {
  const sameAs = [profile.social.linkedin, profile.social.github].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: 'Supply Chain & Operations Professional',
    description: profile.seo.description,
    email: `mailto:${profile.contact.email}`,
    telephone: profile.contact.phone,
    ...(profile.seo.siteUrl ? { url: profile.seo.siteUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Lambton College' },
      { '@type': 'CollegeOrUniversity', name: 'Parul University' },
    ],
    knowsAbout: [
      'Warehouse operations',
      'Inventory control',
      'Supply chain operations',
      'Computer science',
      'Process improvement',
    ],
  };
}

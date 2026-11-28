import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { navigation } from '../data/navigation';
import { projects } from '../data/projects';
import { renderApp } from './helpers';

const h1 = () => screen.findByRole('heading', { level: 1 });

describe('routes', () => {
  it.each([
    ['/', /Building with AWS Cloud Software & People\./],
    ['/about', /^About$/],
    ['/experience', /^Experience$/],
    ['/projects', /^Projects$/],
    ['/skills', /^Skills$/],
    ['/contact', /build something meaningful/i],
    ['/privacy', /Privacy Policy/],
    ['/definitely-not-a-page', /Page not found/],
  ])('renders %s', async (path, heading) => {
    renderApp(path);
    expect(await h1()).toHaveTextContent(heading);
  });

  it.each(projects.map((p) => [p.slug, p.title] as const))(
    'renders project detail /projects/%s',
    async (slug, title) => {
      renderApp(`/projects/${slug}`);
      expect(await h1()).toHaveTextContent(title);
    },
  );

  it('shows a not-found page for an unknown project slug', async () => {
    renderApp('/projects/does-not-exist');
    expect(await h1()).toHaveTextContent(/Page not found/);
  });

  it('every primary navigation item points at a route that renders', async () => {
    renderApp('/');
    await h1();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(navigation.map((n) => n.to));
  });
});

describe('navigation', () => {
  it('navigates between pages from the primary nav', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await h1();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(nav).getByRole('link', { name: 'Experience' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Experience' }),
    ).toBeInTheDocument();
    await user.click(within(nav).getByRole('link', { name: 'Contact' }));
    expect(await h1()).toHaveTextContent(/build something meaningful/i);
    expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('"Let\'s Connect" and hero CTAs lead to real destinations', async () => {
    renderApp('/');
    await h1();
    expect(screen.getAllByRole('link', { name: /let.s connect/i })[0]).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: 'Get in Touch' })).toHaveAttribute('href', '/contact');
    const journey = screen.getByRole('link', { name: /Explore/ });
    expect(journey).toHaveAttribute('href', '#overview');
    expect(document.getElementById('overview')).not.toBeNull();
  });

  it('all internal links on the home page resolve to a known route or an existing section', async () => {
    renderApp('/');
    await h1();
    await screen.findByRole('heading', { name: /Featured projects/ });
    const known = [
      /^\/$/,
      /^\/about$/,
      /^\/experience$/,
      /^\/projects$/,
      /^\/projects\/[a-z0-9-]+$/,
      /^\/skills$/,
      /^\/contact$/,
      /^\/privacy$/,
    ];
    const bad: string[] = [];
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const href = a.getAttribute('href')!;
      if (href.startsWith('#')) {
        if (!document.getElementById(href.slice(1))) bad.push(href);
      } else if (href.startsWith('/')) {
        if (!known.some((r) => r.test(href))) bad.push(href);
        const slug = href.match(/^\/projects\/(.+)$/)?.[1];
        if (slug && !projects.some((p) => p.slug === slug)) bad.push(href);
      }
    });
    expect(bad).toEqual([]);
  });

  it('mobile menu opens as a dialog, closes with Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await h1();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    const dialog = await screen.findByRole('dialog', { name: 'Site menu' });
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(dialog).getAllByRole('link').length).toBeGreaterThanOrEqual(navigation.length);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('mobile menu navigates and closes', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await h1();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = await screen.findByRole('dialog', { name: 'Site menu' });
    await user.click(within(dialog).getByRole('link', { name: 'Skills' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Skills' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('keyboard accessibility', () => {
  it('the first Tab stop is a skip link that targets <main>', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await h1();
    await user.tab();
    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(document.getElementById('main')).not.toBeNull();
  });

  it('global focus styles keep a visible outline (never removed)', () => {
    // Vitest blanks CSS imports, so read the stylesheets from disk (tests run from client/).
    const baseCss = readFileSync(resolve('src/styles/base.css'), 'utf8');
    const pagesCss = readFileSync(resolve('src/styles/pages.css'), 'utf8');
    expect(baseCss).toMatch(/:focus-visible\s*{[^}]*outline:\s*2px solid/);
    expect(pagesCss).toMatch(/\.field input:focus-visible[\s\S]*?outline:\s*2px solid/);
  });
});

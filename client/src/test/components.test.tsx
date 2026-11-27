import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Counter } from '../components/animations/Counter';
import { CustomCursor } from '../components/cursor/CustomCursor';
import { OpsTechSection } from '../components/diagram/OpsTechSection';
import { ExperienceTimeline } from '../components/experience/ExperienceTimeline';
import { Hero } from '../components/hero/Hero';
import { SkillExplorer } from '../components/skills/SkillExplorer';
import { SocialLinks } from '../components/common/SocialLinks';
import { ResumeButton } from '../components/common/ResumeButton';
import { applySeo } from '../lib/seo';
import { renderApp, stubMatchMedia } from './helpers';

// Framer Motion caches the OS preference on first use, so make it controllable per test.
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useReducedMotion: vi.fn(() => false),
}));
beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(false));

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SkillExplorer', () => {
  it('filters by category and announces the result', async () => {
    const user = userEvent.setup();
    wrap(<SkillExplorer initial="all" />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
    await user.click(screen.getByRole('button', { name: 'Equipment and Safety' }));
    expect(await screen.findByText('Reach Truck Operation')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('DC30 Warehouse Operations')).toBeNull());
    expect(screen.getByRole('button', { name: 'Equipment and Safety' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 6 skills in Equipment and Safety.',
    );
  });

  it('shows evidence and no proficiency bars or percentages', () => {
    wrap(<SkillExplorer initial="warehouse" />);
    expect(
      screen.getByText(/Manages shorts and inventory control processes using DALLAS/),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    expect(document.body.textContent).not.toMatch(/\d+\s?%/);
  });
});

describe('ExperienceTimeline', () => {
  it('is an accessible accordion: first role open, others toggle by click and keyboard', async () => {
    const user = userEvent.setup();
    wrap(<ExperienceTimeline />);

    const buttons = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-controls'));

    const [lambton, matrix, bell] = buttons;

    expect(buttons).toHaveLength(5);
    expect(lambton).toHaveAttribute('aria-expanded', 'true');
    expect(matrix).toHaveAttribute('aria-expanded', 'false');

    await user.click(matrix!);
    expect(matrix).toHaveAttribute('aria-expanded', 'true');

    expect(
      await screen.findByText(/Managed inventory operations, investigated shortages/),
    ).toBeInTheDocument();

    expect(lambton).toHaveAttribute('aria-expanded', 'false');

    await user.click(bell!);
    expect(bell).toHaveAttribute('aria-expanded', 'true');

    expect(await screen.findByText(/Led a team of 5–6 sales associates/)).toBeInTheDocument();

    expect(matrix).toHaveAttribute('aria-expanded', 'false');

    bell!.focus();
    await user.keyboard('{Enter}');
    expect(bell).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays all five employment dates verbatim', () => {
    wrap(<ExperienceTimeline />);

    for (const d of [
      'May 2023 \u2013 August 2023',
      'August 2022 \u2013 November 2026',
      'February 2022 \u2013 June 2024',
      'March 2021 \u2013 August 2021',
      'October 2020 \u2013 December 2020',
    ]) {
      expect(screen.getByText(d)).toBeInTheDocument();
    }
  });
});
describe('Operations meets technology', () => {
  it('reveals actual experience and a clearly labelled illustrative idea for the selected step', async () => {
    const user = userEvent.setup();
    wrap(<OpsTechSection />);
    await user.click(screen.getByRole('button', { name: 'Business Systems' }));
    const panel = await screen.findByRole('region', { name: 'Business Systems details' });
    // The panel cross-fades (AnimatePresence mode="wait"), so wait for the new step's content.
    expect(
      await within(panel).findByText(
        /Experience using DALLAS, Microsoft Office, Microsoft Project, Salesforce, and Google Docs\./,
      ),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/From my resume/)).toBeInTheDocument();
    expect(
      within(panel).getByText(/Illustrative idea, not something I have implemented/),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/not a claim of software development experience/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Business Systems' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('supports arrow-key navigation between nodes', async () => {
    const user = userEvent.setup();
    wrap(<OpsTechSection />);
    screen.getByRole('button', { name: 'Warehouse Operations' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Inventory Management' })).toHaveFocus();
    expect(
      await screen.findByRole('region', { name: 'Inventory Management details' }),
    ).toBeInTheDocument();
  });
});

describe('Hero', () => {
  it('explains a node in a tooltip on keyboard focus and hides it on blur', async () => {
    const user = userEvent.setup();
    wrap(<Hero />);
    await user.tab(); // first focusable inside the hero is a CTA; focus the node directly instead
    screen.getByRole('button', { name: 'Inventory' }).focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Keeps system records aligned with physical stock.',
    );
    screen.getByRole('button', { name: 'Inventory' }).blur();
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('shows the required headline, label and calls to action', () => {
    wrap(<Hero />);
    expect(screen.getByText('SUPPLY CHAIN × TECHNOLOGY')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Bridging Supply Chain Operations & Technology.',
    );
    expect(screen.getByRole('link', { name: /Explore/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get in Touch/ })).toBeInTheDocument();
  });

  it('does not show the availability label or a resume button unless configured', () => {
    wrap(<Hero />);
    expect(screen.queryByText('Open to Professional Opportunities')).toBeNull();
    expect(screen.queryByRole('link', { name: /Download Resume/ })).toBeNull();
  });
});

describe('config-gated elements', () => {
  it('renders the configured LinkedIn and GitHub profiles', () => {
    wrap(
      <>
        <SocialLinks />
        <ResumeButton />
      </>,
    );

    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/shivampatel6/',
    );

    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/shivam0612',
    );
  });
});

describe('CustomCursor gating', () => {
  it('is not mounted on touch / coarse pointers', () => {
    stubMatchMedia(() => false);
    const { container } = render(<CustomCursor />);
    expect(container.querySelector('.cursor')).toBeNull();
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false);
  });

  it('mounts for a fine pointer and restores the native cursor on unmount', () => {
    stubMatchMedia((q) => q.includes('hover: hover'));
    const { container, unmount } = render(<CustomCursor />);
    expect(container.querySelector('.cursor__ring')).not.toBeNull();
    expect(container.querySelector('.cursor__dot')).not.toBeNull();
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false);
  });

  it('is disabled when the user prefers reduced motion', () => {
    stubMatchMedia((q) => q.includes('hover: hover'));
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<CustomCursor />);
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false);
    expect(container.querySelector('.cursor')).toBeNull();
  });
});

describe('Counter', () => {
  it('renders the real value (no flash of zero for assistive tech)', () => {
    render(<Counter to={4} suffix="+" />);
    expect(screen.getByText('4+')).toBeInTheDocument();
  });
});

describe('SEO', () => {
  it('sets page titles and emits no canonical URL without a configured site URL', () => {
    applySeo({ title: 'Contact', path: '/contact', description: 'Get in touch.' });
    expect(document.title).toBe('Contact | Shivam Patel');
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Get in touch.',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    applySeo({ path: '/' });
    expect(document.title).toBe('Shivam Patel | Supply Chain, Operations & Technology');
  });

  it('marks unknown pages noindex and updates the title on route change', async () => {
    renderApp('/nowhere');
    await screen.findByRole('heading', { level: 1, name: 'Page not found' });
    await waitFor(() => expect(document.title).toBe('Page not found | Shivam Patel'));
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow',
    );
  });
});

describe('contact page', () => {
  it('provides click-to-call and click-to-email and a labelled form', async () => {
    renderApp('/contact');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getAllByRole('link', { name: 'Shivampatel868@yahoo.com' })[0]).toHaveAttribute(
      'href',
      'mailto:Shivampatel868@yahoo.com',
    );
    expect(screen.getAllByRole('link', { name: '+1 647-877-3709' })[0]).toHaveAttribute(
      'href',
      'tel:+16478773709',
    );
    expect(screen.getAllByRole('link', { name: '+91 7359003709' })[0]).toHaveAttribute(
      'href',
      'tel:+917359003709',
    );
    for (const label of ['Full name', 'Email address', 'Subject', 'Message', 'Inquiry type']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    const linkedinLinks = screen.getAllByRole('link', { name: /LinkedIn/ });
    const githubLinks = screen.getAllByRole('link', { name: /GitHub/ });

    expect(linkedinLinks).toHaveLength(2);
    expect(githubLinks).toHaveLength(2);

    linkedinLinks.forEach((link) =>
      expect(link).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/shivampatel6/',
      ),
    );

    githubLinks.forEach((link) =>
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/shivam0612',
      ),
    );
  });
});

describe('project detail', () => {
  it('labels a concept honestly, shows an empty screenshots state and no invented links', async () => {
    renderApp('/projects/warehouse-inventory-management-system');
    await screen.findByRole('heading', { level: 1, name: 'Warehouse Inventory Management System' });
    expect(screen.getByRole('note')).toHaveTextContent(/This is a concept\. It has not been built/);
    expect(screen.getByText(/No screenshots yet/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planned technologies' })).toBeInTheDocument();
    for (const h of [
      'The problem being explored',
      'Intended users',
      'Proposed workflow',
      'Architecture',
      'Implementation status',
      'Known limitations',
      'Future improvements',
    ]) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }
    expect(screen.queryByRole('link', { name: /github(?! \(opens in a new tab\))|live demo/i })).toBeNull();
  });
});

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './helpers';

describe('Portfolio 1.0 project page', () => {
  it('shows the GitHub link and screenshots, with a disabled Live Demo button', async () => {
    renderApp('/projects/portfolio-1-0');
    await screen.findByRole('heading', { level: 1, name: /Portfolio 1\.0/ });

    const live = screen.getByRole('button', { name: 'Live demo coming soon' });
    expect(live).toBeDisabled();

    const github = screen
      .getAllByRole('link', { name: /github/i })
      .find((a) => a.getAttribute('href') === 'https://github.com/shivam0612/Portfolio-1.0');
    expect(github).toBeDefined();

    const thumbs = await screen.findAllByRole('button', { name: /^View screenshot \d+ of 6/ });
    expect(thumbs).toHaveLength(6);

    for (const h of ['The problem', 'Workflow', 'Features', 'Technologies used']) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }
    expect(screen.queryByRole('note')).toBeNull();
  });
});

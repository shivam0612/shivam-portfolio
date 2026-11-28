import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './helpers';

describe('project screenshots viewer', () => {
  it('opens a popup, moves between screenshots with the arrows and closes with Escape', async () => {
    const user = userEvent.setup();
    renderApp('/projects/aws-hosted-portfolio-deployment');
    await screen.findByRole('heading', { level: 1, name: /AWS-Hosted Portfolio/ });

    const thumbs = await screen.findAllByRole('button', { name: /^View screenshot \d+ of \d+/ });
    expect(thumbs.length).toBeGreaterThan(1);
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(thumbs[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Screenshot viewer' });
    expect(within(dialog).getByText(`1 / ${thumbs.length}`)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Next screenshot' }));
    expect(within(dialog).getByText(`2 / ${thumbs.length}`)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(within(dialog).getByText(`1 / ${thumbs.length}`)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

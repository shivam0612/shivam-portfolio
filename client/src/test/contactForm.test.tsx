import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '../components/contact/ContactForm';
import { submitContact, type SubmitResult } from '../lib/api';

vi.mock('../lib/api', () => ({ submitContact: vi.fn() }));
const submit = vi.mocked(submitContact);

const setup = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <ContactForm />
    </MemoryRouter>,
  );
  return user;
};

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), '  Alex Morgan ');
  await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
  await user.selectOptions(screen.getByLabelText('Inquiry type'), 'Collaboration');
  await user.type(screen.getByLabelText('Subject'), 'Working together');
  await user.type(screen.getByLabelText('Message'), 'I would like to discuss a collaboration.');
  await user.click(screen.getByRole('checkbox', { name: /I agree/ }));
}
const send = () => screen.getByRole('button', { name: /send message|sending/i });
const deferred = () => {
  let resolve!: (v: SubmitResult) => void;
  const promise = new Promise<SubmitResult>((r) => (resolve = r));
  return { promise, resolve };
};

beforeEach(() => submit.mockReset());

describe('ContactForm validation', () => {
  it('blocks an empty submission, shows an error per required field and never calls the API', async () => {
    const user = setup();
    await user.click(send());
    expect(await screen.findByText('Enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Choose an inquiry type.')).toBeInTheDocument();
    expect(screen.getByText('Enter a subject.')).toBeInTheDocument();
    expect(screen.getByText('Write a message.')).toBeInTheDocument();
    expect(screen.getByText(/must agree to the privacy notice/i)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription('Enter your full name.');
  });

  it('rejects malformed email and whitespace-only message', async () => {
    const user = setup();
    await user.type(screen.getByLabelText('Email address'), 'nope');
    await user.type(screen.getByLabelText('Message'), '          ');
    await user.click(send());
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText('Write a message.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it('enforces maximum lengths', async () => {
    const user = setup();
    await user.click(screen.getByLabelText('Subject'));
    await user.paste('x'.repeat(151));
    await user.click(send());
    expect(await screen.findByText(/Subject must be at most 150/)).toBeInTheDocument();
  });

  it('treats organization as optional', async () => {
    const user = setup();
    submit.mockResolvedValue({ ok: true, reference: 'SP-TEST' });
    await fillValid(user);
    await user.click(send());
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit.mock.calls[0]![0].organization).toBe('');
  });
});

describe('ContactForm submission', () => {
  it('shows a loading state, prevents duplicate submits, then shows the server reference', async () => {
    const user = setup();
    const d = deferred();
    submit.mockReturnValue(d.promise);
    await fillValid(user);
    await user.dblClick(send());
    await waitFor(() => expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled());
    expect(screen.getByRole('button', { name: /sending/i })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/Sending your message/)).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);

    d.resolve({ ok: true, reference: 'SP-ABC123-XYZ789' });
    expect(await screen.findByText('Thank you for reaching out.')).toBeInTheDocument();
    expect(screen.getByText('Your message has been received.')).toBeInTheDocument();
    expect(screen.getByText('SP-ABC123-XYZ789')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('sends trimmed values exactly as the API expects', async () => {
    const user = setup();
    submit.mockResolvedValue({ ok: true, reference: 'SP-1' });
    await fillValid(user);
    await user.click(send());
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0]![0]).toMatchObject({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      inquiryType: 'Collaboration',
      subject: 'Working together',
      consent: true,
    });
  });

  it('never claims email delivery on success', async () => {
    const user = setup();
    submit.mockResolvedValue({ ok: true, reference: 'SP-1' });
    await fillValid(user);
    await user.click(send());
    await screen.findByText('Thank you for reaching out.');
    expect(document.body.textContent).not.toMatch(/email (was )?(sent|delivered)/i);
  });

  it('can start a new message after success', async () => {
    const user = setup();
    submit.mockResolvedValue({ ok: true, reference: 'SP-1' });
    await fillValid(user);
    await user.click(send());
    await user.click(await screen.findByRole('button', { name: 'Send another message' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('');
  });

  it("keeps the visitor's input and shows a helpful alert after a server failure", async () => {
    const user = setup();
    submit.mockResolvedValue({
      ok: false,
      kind: 'server',
      message: "We couldn't submit your message right now.",
    });
    await fillValid(user);
    await user.click(send());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/couldn.t submit your message right now/i);
    expect(alert).toHaveTextContent('Shivampatel868@yahoo.com');
    expect(screen.getByLabelText('Subject')).toHaveValue('Working together');
    expect(screen.getByLabelText('Message')).toHaveValue(
      'I would like to discuss a collaboration.',
    );
    expect(send()).toBeEnabled();
    expect(screen.queryByText('Thank you for reaching out.')).toBeNull();
  });

  it('handles an unreachable network the same way and allows retry', async () => {
    const user = setup();
    submit.mockResolvedValueOnce({
      ok: false,
      kind: 'network',
      message: "We couldn't reach the server.",
    });
    submit.mockResolvedValueOnce({ ok: true, reference: 'SP-RETRY' });
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByRole('alert')).toHaveTextContent(/reach the server/);
    await user.click(send());
    expect(await screen.findByText('SP-RETRY')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows rate-limit guidance with a retry hint', async () => {
    const user = setup();
    submit.mockResolvedValue({
      ok: false,
      kind: 'rate_limited',
      message: 'You have sent several messages recently.',
      retryAfterSeconds: 600,
    });
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /several messages recently.*about 10 minutes/,
    );
  });

  it('maps server-side field errors onto the matching inputs', async () => {
    const user = setup();
    submit.mockResolvedValue({
      ok: false,
      kind: 'validation',
      message: 'Please correct the highlighted fields.',
      fieldErrors: { email: 'Server says this address is not allowed.' },
    });
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByText('Server says this address is not allowed.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
  });
});

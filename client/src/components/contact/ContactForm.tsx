import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';
import { submitContact, type SubmitFailure } from '../../lib/api';
import {
  contactFormSchema,
  INQUIRY_TYPES,
  LIMITS,
  type ContactFormValues,
} from '../../lib/contactSchema';
import { Button } from '../common/Button';

const defaults: ContactFormValues = {
  name: '',
  email: '',
  organization: '',
  subject: '',
  inquiryType: '',
  message: '',
  consent: false,
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field__error">
      <CircleAlert size={14} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

function retryText(seconds?: number) {
  if (!seconds) return '';
  const minutes = Math.ceil(seconds / 60);
  return minutes > 1
    ? ` Please try again in about ${minutes} minutes.`
    : ' Please try again in a minute.';
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: defaults,
    mode: 'onTouched',
  });
  const [reference, setReference] = useState<string | null>(null);
  const [failure, setFailure] = useState<SubmitFailure | null>(null);
  const inFlight = useRef(false); // blocks a second request before React has re-rendered the disabled button

  const messageLength = useWatch({ control, name: 'message' })?.length ?? 0;

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    const result = await submitContact(values);
    if (result.ok) {
      setReference(result.reference);
      return;
    }
    if (result.kind === 'validation') {
      const fields = Object.entries(result.fieldErrors).filter(([k]) => k !== '_form');
      fields.forEach(([name, message]) =>
        setError(name as keyof ContactFormValues, { type: 'server', message }),
      );
      const first = fields[0]?.[0];
      if (first) setFocus(first as keyof ContactFormValues);
      if (fields.length === 0) setFailure(result);
      return;
    }
    setFailure(result);
  });

  // Guard in the event handler: a second submit is ignored even before React re-renders the disabled button.
  const guardedSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await onSubmit(event);
    } finally {
      inFlight.current = false;
    }
  };

  if (reference) {
    return (
      <motion.div
        className="sent"
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg className="sent__icon" viewBox="0 0 64 64" aria-hidden="true">
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7 }}
          />
          <motion.path
            d="M20 33 l8 8 16 -18"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          />
        </svg>
        <h2 className="sent__title">Thank you for reaching out.</h2>
        <p>Your message has been received.</p>
        <p className="sent__ref">
          Reference number <strong>{reference}</strong>
        </p>
        <p className="sent__hint">Keep this reference if you follow up by email.</p>
        <Button
          variant="ghost"
          icon="none"
          onClick={() => {
            reset(defaults);
            setReference(null);
          }}
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  const describe = (name: keyof ContactFormValues) => (errors[name] ? `${name}-error` : undefined);

  return (
    <form className="form" onSubmit={guardedSubmit} noValidate aria-describedby="form-status">
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name.max + 20}
          aria-invalid={!!errors.name}
          aria-describedby={describe('name')}
          {...register('name')}
        />
        <FieldError id="name-error" message={errors.name?.message} />
      </div>

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          aria-describedby={describe('email')}
          {...register('email')}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div className="field">
        <label htmlFor="organization">
          Organization <span className="field__opt">(optional)</span>
        </label>
        <input
          id="organization"
          type="text"
          autoComplete="organization"
          aria-invalid={!!errors.organization}
          aria-describedby={describe('organization')}
          {...register('organization')}
        />
        <FieldError id="organization-error" message={errors.organization?.message} />
      </div>

      <div className="field">
        <label htmlFor="inquiryType">Inquiry type</label>
        <select
          id="inquiryType"
          aria-invalid={!!errors.inquiryType}
          aria-describedby={describe('inquiryType')}
          {...register('inquiryType')}
        >
          <option value="">Choose an inquiry type</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <FieldError id="inquiryType-error" message={errors.inquiryType?.message} />
      </div>

      <div className="field field--wide">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          type="text"
          aria-invalid={!!errors.subject}
          aria-describedby={describe('subject')}
          {...register('subject')}
        />
        <FieldError id="subject-error" message={errors.subject?.message} />
      </div>

      <div className="field field--wide">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={`message-count${errors.message ? ' message-error' : ''}`}
          {...register('message')}
        />
        <div className="field__row">
          <FieldError id="message-error" message={errors.message?.message} />
          <span
            id="message-count"
            className={`field__count${messageLength > LIMITS.message.max ? ' is-over' : ''}`}
          >
            {messageLength} / {LIMITS.message.max}
          </span>
        </div>
      </div>

      <div className="field field--wide">
        <label className="check" htmlFor="consent">
          <input
            id="consent"
            type="checkbox"
            aria-invalid={!!errors.consent}
            aria-describedby={describe('consent')}
            {...register('consent')}
          />
          <span>
            I agree that my details may be stored and used to reply to this message, as described in
            the{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              privacy policy<span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent?.message} />
      </div>

      <p className="privacy-note field--wide">
        What happens to your message: it is sent to this site&apos;s server, stored in a database,
        and may be forwarded to my email so I can reply. It is not sold or used for marketing.
      </p>

      <div id="form-status" className="field--wide" aria-live="polite">
        {isSubmitting && <p className="form__sending">Sending your message…</p>}
        {failure && (
          <div className="form__error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <p>
                {failure.kind === 'rate_limited'
                  ? `${failure.message}${retryText(failure.retryAfterSeconds)}`
                  : failure.kind === 'too_large'
                    ? failure.message
                    : "We couldn't submit your message right now. Please try again or contact me directly by email."}
              </p>
              {failure.kind !== 'rate_limited' && failure.kind !== 'too_large' && (
                <p className="form__error-detail">{failure.message}</p>
              )}
              <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
            </div>
          </div>
        )}
      </div>

      <div className="field--wide">
        <Button
          type="submit"
          disabled={isSubmitting}
          busy={isSubmitting}
          icon="arrow"
          cursorLabel="SEND"
        >
          {isSubmitting ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}

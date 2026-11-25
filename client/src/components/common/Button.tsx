import { ArrowRight, ArrowUpRight, Download, Loader } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'quiet';
  icon?: 'arrow' | 'external' | 'download' | 'none';
  /** Internal route (client-side navigation). */
  to?: string;
  /** Plain URL: in-page anchor, mailto:, tel:, or file download. */
  href?: string;
  download?: string | boolean;
  external?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  busy?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  'aria-label'?: string;
  cursorLabel?: string;
}

const icons = { arrow: ArrowRight, external: ArrowUpRight, download: Download };

/** The single button primitive: router link, plain anchor, or <button>, with a moving-arrow hover. */
export function Button({
  children,
  variant = 'primary',
  icon = 'arrow',
  to,
  href,
  download,
  external,
  type = 'button',
  disabled,
  busy,
  onClick,
  className = '',
  cursorLabel,
  ...aria
}: ButtonProps) {
  const cls = `btn btn--${variant} ${className}`.trim();
  const Icon = icon === 'none' ? null : icons[icon];
  const content = (
    <>
      <span className="btn__label">{children}</span>
      {busy ? (
        <Loader className="btn__icon btn__icon--spin" size={18} aria-hidden="true" />
      ) : (
        Icon && <Icon className={`btn__icon btn__icon--${icon}`} size={18} aria-hidden="true" />
      )}
    </>
  );
  const common = {
    className: cls,
    onClick,
    'data-cursor': 'button',
    'data-cursor-label': cursorLabel,
    ...aria,
  };

  if (to)
    return (
      <Link to={to} {...common}>
        {content}
      </Link>
    );
  if (href) {
    return (
      <a
        href={href}
        download={download}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...common}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} aria-busy={busy || undefined} {...common}>
      {content}
    </button>
  );
}

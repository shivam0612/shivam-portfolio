import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';
import type { NavItem } from '../../data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  activeKey: string;
  toggleRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Full-screen navigation dialog. Moves focus in on open, traps Tab between the menu and its toggle
 * button, closes on Escape, locks page scroll, and returns focus to the toggle on close.
 */
export function MobileMenu({ open, onClose, items, activeKey, toggleRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = [
        ...(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? []),
        ...(toggle ? [toggle] : []),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      toggle?.focus();
    };
  }, [open, onClose, toggleRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <ul className="mobile-menu__list">
            {items.map((item, i) => (
              <motion.li
                key={item.to}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.045, duration: 0.3 }}
              >
                <Link
                  to={item.to}
                  className="mobile-menu__link"
                  aria-current={activeKey === item.to ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
          <div className="mobile-menu__foot">
            <Link to="/contact" className="btn btn--primary">
              <span className="btn__label">Let&apos;s Connect</span>
            </Link>
            <a href={`mailto:${profile.contact.email}`} className="mobile-menu__contact">
              {profile.contact.email}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { homeSections, navigation, sectionToNav } from '../../data/navigation';
import { profile } from '../../data/profile';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useScrollPast } from '../../hooks/useScrollPast';
import { Magnetic } from '../animations/Magnetic';
import { Button } from '../common/Button';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const { pathname } = useLocation();
  const scrolled = useScrollPast(12);
  const onHome = pathname === '/';
  const spy = useActiveSection(homeSections, onHome);
  // The menu is "open for" the route it was opened on, so any navigation closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpenFor(null), []);

  // The highlighted item follows scrolling on "/", and follows the route elsewhere.
  const routeKey =
    navigation.find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)))?.to ?? '';
  const activeKey = onHome ? (sectionToNav[spy ?? 'top'] ?? '/') : routeKey;

  return (
    <header className={`navbar${scrolled || open ? ' is-scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="brand" aria-label={`${profile.name}, home`} data-cursor="link">
          <span className="brand__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="brand__name">{profile.name}</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">
            {navigation.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="nav__link"
                  data-active={activeKey === item.to || undefined}
                  aria-current={item.to === routeKey ? 'page' : undefined}
                >
                  {activeKey === item.to && (
                    <motion.span
                      layoutId="nav-pill"
                      className="nav__pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="nav__text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <span className="navbar__cta">
            <Magnetic>
              <Button to="/contact" cursorLabel="CONNECT">
                Let&apos;s Connect
              </Button>
            </Magnetic>
          </span>
          <button
            ref={toggleRef}
            type="button"
            className="navbar__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <MobileMenu
        open={open}
        onClose={close}
        items={navigation}
        activeKey={routeKey}
        toggleRef={toggleRef}
      />
    </header>
  );
}

import { MotionConfig, motion } from 'framer-motion';
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AmbientBackground } from '../background/AmbientBackground';
import { CustomCursor } from '../cursor/CustomCursor';
import { IntroGate } from '../intro/IntroGate';
import { Navbar } from '../navigation/Navbar';
import { EASE } from '../animations/Reveal';
import { BackToTop } from './BackToTop';
import { Footer } from './Footer';
import { PageFallback } from './PageFallback';
import { ScrollProgress } from './ScrollProgress';

/** Page shell. MotionConfig makes every transform animation respect prefers-reduced-motion. */
export function Layout() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  const mainRef = useRef<HTMLElement>(null);

  // On navigation: honour #hash links, otherwise jump to top; move focus to <main> for keyboard/AT users.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!hash) return;
    }
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return (
    <MotionConfig reducedMotion="user">
      <IntroGate>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <AmbientBackground />
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main id="main" ref={mainRef} tabIndex={-1} className="main">
          <Suspense fallback={<PageFallback />}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
        <Footer />
        <BackToTop />
      </IntroGate>
    </MotionConfig>
  );
}

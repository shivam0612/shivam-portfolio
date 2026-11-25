import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { preloadRoute } from '../../pages/loaders';
import { IntroContext } from './IntroContext';
import { LoadingScreen } from './LoadingScreen';

export const INTRO_SEEN_KEY = 'sp-intro-seen';
/** If the app is ready within this window the intro is skipped entirely (no flash, no delay). */
const QUICK_MS = 500;
const MIN_VISIBLE_MS = 700;
const MAX_WAIT_MS = 3200;

type Phase = 'checking' | 'splash' | 'done';

/** Set VITE_DISABLE_INTRO=true to never show the intro (fastest possible first paint). */
const introDisabled = import.meta.env.VITE_DISABLE_INTRO === 'true';

const seen = () => {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    /* storage unavailable: the intro may simply play again next visit */
  }
};

/** Resolves when web fonts and the current route's code are ready. */
const whenReady = () =>
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    preloadRoute(window.location.pathname),
  ]).then(
    () => undefined,
    () => undefined,
  );

/**
 * Plays the intro only when loading is actually slow. Warm loads, repeat visits in a session and
 * reduced-motion users skip it. The splash waits on real readiness, is capped, and can be skipped.
 */
export function IntroGate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(() =>
    reduce || introDisabled || seen() ? 'done' : 'checking',
  );
  const skipRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (phase !== 'checking') return;
    let cancelled = false;
    const quick = new Promise<'slow'>((resolve) => setTimeout(() => resolve('slow'), QUICK_MS));
    void Promise.race([whenReady().then(() => 'ready' as const), quick]).then((result) => {
      if (cancelled) return;
      if (result === 'ready') {
        markSeen();
        setPhase('done');
      } else setPhase('splash');
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'splash') return;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      markSeen();
      setPhase('done');
    };
    skipRef.current = finish;
    const minimum = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS));
    void whenReady()
      .then(() => minimum)
      .then(finish);
    const cap = setTimeout(finish, MAX_WAIT_MS);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => {
      finished = true;
      clearTimeout(cap);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  const skip = useCallback(() => skipRef.current(), []);

  return (
    <IntroContext.Provider value={{ revealed: phase === 'done' }}>
      <div className="app-shell" data-intro={phase} inert={phase !== 'done' || undefined}>
        {children}
      </div>
      <AnimatePresence>{phase === 'splash' && <LoadingScreen onSkip={skip} />}</AnimatePresence>
    </IntroContext.Provider>
  );
}

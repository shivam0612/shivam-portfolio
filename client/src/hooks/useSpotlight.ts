import { useCallback, type PointerEvent } from 'react';

/**
 * Pointer-follow glow for cards. Writes --mx/--my CSS variables straight to the element
 * (no React state, no re-render per pointer move). The glow itself is pure CSS.
 */
export function useSpotlight<T extends HTMLElement>() {
  return useCallback((event: PointerEvent<T>) => {
    if (event.pointerType !== 'mouse') return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, []);
}

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useFinePointer } from '../../hooks/useMediaQuery';

/**
 * Dot + trailing ring. Markup opts in to contextual states with data attributes:
 *   data-cursor="card|diagram|link|button"   data-cursor-label="EXPLORE"
 * Pointer position lives in refs and is applied with transforms inside one rAF loop, so moving the
 * mouse never triggers a React render or a layout. Disabled for touch/coarse pointers and for
 * prefers-reduced-motion (the native cursor stays).
 */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = 0;
    let visible = false;
    let state = 'default';
    let labelText = '';

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const setState = (next: string, text = '') => {
      if (next !== state) {
        state = next;
        ring.dataset.state = next;
        dot.dataset.state = next;
      }
      if (text !== labelText) {
        labelText = text;
        label.textContent = text;
      }
    };

    const resolve = (el: Element | null) => {
      if (!el) return setState('default');
      if (el.closest('input, textarea, select, [contenteditable="true"]'))
        return setState('hidden');
      const marked = el.closest<HTMLElement>('[data-cursor]');
      if (marked)
        return setState(marked.dataset.cursor ?? 'link', marked.dataset.cursorLabel ?? '');
      if (el.closest('button, [role="button"], summary')) return setState('button');
      if (el.closest('a[href]')) return setState('link');
      setState('default');
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = target.x;
        ringPos.y = target.y;
        root.classList.add('cursor-visible');
      }
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      resolve(e.target as Element | null);
    };
    const onDown = () => {
      ring.classList.remove('is-pulsing');
      void ring.offsetWidth; // restart the CSS pulse animation
      ring.classList.add('is-pulsing');
    };
    const onLeave = () => {
      visible = false;
      root.classList.remove('cursor-visible');
    };

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      root.classList.remove('has-custom-cursor', 'cursor-visible');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring" data-state="default">
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" data-state="default" />
    </div>
  );
}

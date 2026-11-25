import { useEffect, useState } from 'react';

/**
 * Returns the id of the section that currently crosses the middle band of the viewport.
 *
 * Route pages are lazy-loaded, so the sections usually do not exist yet when this hook first runs.
 * It therefore waits (via a MutationObserver) until every id is present before observing them.
 * When the page is scrolled to the very bottom, the last section is reported, since it can no
 * longer reach the middle band.
 */
export function useActiveSection(ids: readonly string[], enabled = true): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join('|');

  useEffect(() => {
    if (!enabled) return;
    const wanted = key.split('|');
    let intersection: IntersectionObserver | null = null;
    let mutation: MutationObserver | null = null;
    let onScroll: (() => void) | null = null;

    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

    const attach = (): boolean => {
      const elements = wanted
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (elements.length < wanted.length) return false;

      const visible = new Set<string>();
      const last = elements[elements.length - 1]!;
      intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          if (atBottom()) return setActive(last.id);
          // Earliest section in document order that is inside the band.
          const first = elements.find((el) => visible.has(el.id));
          if (first) setActive(first.id);
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] },
      );
      elements.forEach((el) => intersection!.observe(el));

      onScroll = () => {
        if (atBottom()) setActive(last.id);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return true;
    };

    if (!attach()) {
      mutation = new MutationObserver(() => {
        if (attach()) {
          mutation?.disconnect();
          mutation = null;
        }
      });
      mutation.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      intersection?.disconnect();
      mutation?.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, [key, enabled]);

  return enabled ? active : null;
}

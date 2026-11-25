import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useActiveSection } from '../hooks/useActiveSection';

function Probe({ ids }: { ids: string[] }) {
  const active = useActiveSection(ids);
  return <p data-testid="active">{active}</p>;
}

/** Regression: pages are lazy-loaded, so the sections mount AFTER the hook first runs. */
function LateSections() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <Probe ids={['alpha', 'beta']} />
      <button onClick={() => setReady(true)}>mount</button>
      {ready && (
        <>
          <section id="alpha" />
          <section id="beta" />
        </>
      )}
    </>
  );
}

describe('useActiveSection', () => {
  it('starts on the first id', () => {
    render(<Probe ids={['x', 'y']} />);
    expect(screen.getByTestId('active')).toHaveTextContent('x');
  });

  it('observes every section once all of them exist', async () => {
    const observed: string[] = [];
    const Real = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(private cb: IntersectionObserverCallback) {}
      observe(el: Element) {
        observed.push(el.id);
        this.cb(
          [
            {
              isIntersecting: el.id === 'beta',
              target: el,
            } as unknown as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        );
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    try {
      render(<LateSections />);
      expect(observed).toEqual([]); // nothing mounted yet, nothing observed
      await act(async () => screen.getByText('mount').click());
      expect(observed).toEqual(['alpha', 'beta']);
      expect(screen.getByTestId('active')).toHaveTextContent('beta');
    } finally {
      globalThis.IntersectionObserver = Real;
    }
  });
});

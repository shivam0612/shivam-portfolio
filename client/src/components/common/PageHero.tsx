import type { ReactNode } from 'react';
import { Reveal } from '../animations/Reveal';

/** Title block used at the top of every inner page. */
export function PageHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-hero container">
      <h1 className="page-hero__title">{title}</h1>
      {children && (
        <Reveal y={10} delay={0.08}>
          <div className="page-hero__lead">{children}</div>
        </Reveal>
      )}
    </header>
  );
}

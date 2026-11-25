import type { ReactNode } from 'react';
import { MaskText, type MaskToken } from '../animations/MaskText';
import { Reveal } from '../animations/Reveal';

interface Props {
  title: string | MaskToken[];
  children?: ReactNode;
  id?: string;
  level?: 'h1' | 'h2';
}

/** Left-aligned section title with a short supporting paragraph. */
export function SectionHeading({ title, children, id, level = 'h2' }: Props) {
  const tokens: MaskToken[] = typeof title === 'string' ? [{ text: title }] : title;
  return (
    <header className="section-head">
      <MaskText tokens={tokens} as={level} inView className="section-head__title" key={id} />
      {children && (
        <Reveal delay={0.15}>
          <div className="section-head__lead">{children}</div>
        </Reveal>
      )}
    </header>
  );
}

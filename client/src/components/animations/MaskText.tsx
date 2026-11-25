import { motion } from 'framer-motion';
import { Fragment } from 'react';
import { EASE } from './Reveal';

export type MaskToken = { text: string; className?: string; nowrap?: boolean } | 'br';

interface MaskTextProps {
  tokens: MaskToken[];
  /** When false the words wait below their masks. */
  active?: boolean;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** Reveal when scrolled into view instead of via `active`. */
  inView?: boolean;
}

/** Word-by-word mask reveal. Real text stays in the DOM, so it reads naturally to assistive tech. */
export function MaskText({
  tokens,
  active = true,
  delay = 0,
  className,
  as = 'h2',
  inView = false,
}: MaskTextProps) {
  const Tag = motion[as];
  let index = 0;
  const visibility = inView
    ? {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, margin: '0px 0px -10% 0px' },
      }
    : { initial: 'hidden', animate: active ? 'show' : 'hidden' };

  return (
    <Tag className={className} {...visibility}>
      {tokens.map((token, t) => {
        if (token === 'br') return <br key={`br-${t}`} />;
        const parts = token.text.split(' ');
        const words = parts.map((word, w) => {
          const i = index++;
          return (
            <Fragment key={`${word}-${w}`}>
              <span className="mask-word">
                <motion.span
                  className={`mask-word__inner ${token.className ?? ''}`}
                  variants={{
                    hidden: { y: '110%' },
                    show: {
                      y: '0%',
                      transition: { duration: 0.75, ease: EASE, delay: delay + i * 0.07 },
                    },
                  }}
                >
                  {word}
                </motion.span>
              </span>
              {w < parts.length - 1 ? ' ' : null}
            </Fragment>
          );
        });
        // The space between tokens sits OUTSIDE any nowrap group so it stays a legal line-break point.
        return (
          <Fragment key={`${token.text}-${t}`}>
            {token.nowrap ? <span className="nowrap">{words}</span> : words}{' '}
          </Fragment>
        );
      })}
    </Tag>
  );
}

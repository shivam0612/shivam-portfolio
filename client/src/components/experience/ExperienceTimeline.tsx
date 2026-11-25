import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import { experience } from '../../data/experience';
import type { ExperienceEntry } from '../../data/types';
import { EASE } from '../animations/Reveal';

const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } };
const row = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

function TimelineItem({
  entry,
  open,
  onToggle,
}: {
  entry: ExperienceEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const headId = `${entry.id}-header`;
  const panelId = `${entry.id}-panel`;
  return (
    <motion.li
      className={`timeline__item${open ? ' is-open' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <span className="timeline__marker" aria-hidden="true" />
      <h3 className="timeline__heading">
        <button
          type="button"
          id={headId}
          className="timeline__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          data-cursor="button"
        >
          <span className="timeline__dates">{entry.dates}</span>
          <span className="timeline__role">{entry.title}</span>
          <span className="timeline__employer">
            {entry.employer}
            {entry.employerNote && <span className="timeline__note"> ({entry.employerNote})</span>}
          </span>
          <ChevronDown className="timeline__chevron" size={20} aria-hidden="true" />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headId}
            className="timeline__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.38, ease: EASE }}
          >
            <motion.ul className="timeline__resp" variants={list} initial="hidden" animate="show">
              {entry.responsibilities.map((r) => (
                <motion.li key={r} variants={row}>
                  {r}
                </motion.li>
              ))}
            </motion.ul>

            <div className="timeline__tags">
              <ul className="tags" aria-label="Relevant skills">
                {entry.skills.map((s, i) => (
                  <motion.li
                    key={s}
                    className="tag"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.03, duration: 0.25 }}
                  >
                    {s}
                  </motion.li>
                ))}
              </ul>
              {entry.technology.length > 0 && (
                <div className="timeline__tech">
                  <p className="timeline__tech-label">Technology exposure</p>
                  <ul className="tags" aria-label="Technology exposure">
                    {entry.technology.map((t) => (
                      <li key={t} className="tag tag--tech">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/** Vertical timeline; each entry is an accessible accordion. The rail fills as the section scrolls past. */
export function ExperienceTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(experience[0]?.id ?? null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="timeline" ref={ref}>
      <div className="timeline__rail" aria-hidden="true">
        <motion.span className="timeline__fill" style={{ scaleY }} />
      </div>
      <ol className="timeline__list">
        {experience.map((entry) => (
          <TimelineItem
            key={entry.id}
            entry={entry}
            open={openId === entry.id}
            onToggle={() => setOpenId((cur) => (cur === entry.id ? null : entry.id))}
          />
        ))}
      </ol>
    </div>
  );
}

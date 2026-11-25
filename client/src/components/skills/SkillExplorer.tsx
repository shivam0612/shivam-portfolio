import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { skillCategories } from '../../data/skills';
import type { Skill, SkillCategory } from '../../data/types';
import { useSpotlight } from '../../hooks/useSpotlight';
import { categoryIcons } from '../common/iconMaps';

type Filter = 'all' | SkillCategory['id'];

function SkillCard({
  skill,
  Icon,
}: {
  skill: Skill;
  Icon: (typeof categoryIcons)[SkillCategory['icon']];
}) {
  const spotlight = useSpotlight<HTMLLIElement>();
  return (
    <li className="skill spotlight" onPointerMove={spotlight}>
      <Icon className="skill__icon" size={18} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <h4 className="skill__name">{skill.name}</h4>
        <p className="skill__evidence">{skill.evidence}</p>
      </div>
    </li>
  );
}

/**
 * Filterable competency cards. Each skill shows what the resume says that supports it — there are
 * deliberately no percentages, ratings or progress bars.
 */
export function SkillExplorer({ initial = 'all' }: { initial?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initial);
  const visible = useMemo(
    () => skillCategories.filter((c) => filter === 'all' || c.id === filter),
    [filter],
  );
  const count = visible.reduce((n, c) => n + c.skills.length, 0);
  const label =
    filter === 'all' ? 'all categories' : skillCategories.find((c) => c.id === filter)?.label;

  return (
    <div className="skills">
      <div className="filters" role="group" aria-label="Filter skills by category">
        {[{ id: 'all' as const, label: 'All categories' }, ...skillCategories].map((c) => (
          <button
            key={c.id}
            type="button"
            className="filter"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
            data-cursor="button"
          >
            {filter === c.id && (
              <motion.span
                layoutId={`filter-bg-${initial}`}
                className="filter__bg"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="filter__text">{c.label}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        Showing {count} skills in {label}.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {visible.map((cat) => {
            const Icon = categoryIcons[cat.icon];
            return (
              <section key={cat.id} className="skills__group" aria-labelledby={`cat-${cat.id}`}>
                <header className="skills__head">
                  <h3 id={`cat-${cat.id}`}>{cat.label}</h3>
                  <p>{cat.description}</p>
                </header>
                <ul className="skills__grid">
                  {cat.skills.map((s) => (
                    <SkillCard key={s.name} skill={s} Icon={Icon} />
                  ))}
                </ul>
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

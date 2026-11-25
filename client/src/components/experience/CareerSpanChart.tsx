import { motion } from 'framer-motion';
import { experience } from '../../data/experience';
import { EASE } from '../animations/Reveal';

const toMonths = (ym: string) => {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  return y * 12 + (m - 1);
};

/**
 * Employment periods drawn exactly as listed on the resume (including "Present" as today).
 * It is a straightforward rendering of the dates — no interpretation of any overlap is implied.
 */
export function CareerSpanChart() {
  const now = new Date();
  const nowMonths = now.getFullYear() * 12 + now.getMonth();
  const start = Math.min(...experience.map((e) => toMonths(e.range.start)));
  const startYear = Math.floor(start / 12);
  const endYear = now.getFullYear() + 1;
  const min = startYear * 12;
  const max = endYear * 12;
  const pct = (months: number) => ((months - min) / (max - min)) * 100;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <figure className="span-chart">
      <figcaption className="span-chart__caption">
        Employment periods, as listed on the resume
      </figcaption>
      <div className="span-chart__axis" aria-hidden="true">
        {years.map((y) => (
          <span key={y} style={{ left: `${pct(y * 12)}%` }}>
            {y}
          </span>
        ))}
      </div>
      <ul className="span-chart__rows">
        {experience.map((e, i) => {
          const from = pct(toMonths(e.range.start));
          const to = pct(e.range.end ? toMonths(e.range.end) + 1 : nowMonths + 1);
          return (
            <li key={e.id} className="span-chart__row">
              <div className="span-chart__label">
                <span>{e.employer}</span>
                <span className="span-chart__dates">{e.dates}</span>
              </div>
              <div className="span-chart__track" aria-hidden="true">
                {years.map((y) => (
                  <i key={y} style={{ left: `${pct(y * 12)}%` }} />
                ))}
                <motion.span
                  className={`span-chart__bar span-chart__bar--${i}`}
                  style={{
                    left: `${from}%`,
                    width: `${to - from}%`,
                    transformOrigin: 'left center',
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.12 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

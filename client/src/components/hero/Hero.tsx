import { motion } from 'framer-motion';
import { ChevronDown, Database, Gauge, Truck } from 'lucide-react';
import { heroFlow } from '../../data/flow';
import { profile } from '../../data/profile';
import { EASE } from '../animations/Reveal';
import { Magnetic } from '../animations/Magnetic';
import { MaskText, type MaskToken } from '../animations/MaskText';
import { Button } from '../common/Button';
import { ResumeButton } from '../common/ResumeButton';
import { FlowDiagram } from '../diagram/FlowDiagram';
import { useIntro } from '../intro/IntroContext';
import { NetworkBackground } from './NetworkBackground';

const headline: MaskToken[] = [
  { text: 'Building with' },
  { text: 'AWS Cloud', className: 'gradient-text', nowrap: true },
  'br',
  { text: 'Software &', nowrap: true },
  { text: 'People.', className: 'gradient-text gradient-text--alt' },
];

const chips = [
  { Icon: Truck, cls: 'a', label: 'AWS' },
  { Icon: Database, cls: 'b', label: 'DevOps' },
  { Icon: Gauge, cls: 'c', label: 'Infrastructure' },
] as const;

export function Hero() {
  const { revealed } = useIntro();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <NetworkBackground />
      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.p className="hero__label" {...fade(0)}>
            {profile.heroLabel}
          </motion.p>
          <MaskText
            as="h1"
            tokens={headline}
            active={revealed}
            delay={0.05}
            className="hero__title"
            key="hero-title"
          />
          <motion.p className="hero__lead" {...fade(0.4)}>
            {profile.heroSupporting}
          </motion.p>
          {profile.availability.show && (
            <motion.p className="availability" {...fade(0.45)}>
              <span className="availability__dot" aria-hidden="true" />
              {profile.availability.label}
            </motion.p>
          )}
          <motion.div className="hero__actions" {...fade(0.5)}>
            <Magnetic>
              <Button href="#overview" cursorLabel="EXPLORE">
                Explore
              </Button>
            </Magnetic>
            <Button to="/contact" variant="ghost">
              Get in Touch
            </Button>
            <ResumeButton />
          </motion.div>
        </div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        >
          <div className="control panel">
            <div className="control__bar">
              <span className="control__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="control__title">Cloud deployment flow</span>
              <span className="control__badge">Illustrative</span>
            </div>
            <FlowDiagram
              mode="tooltip"
              nodes={heroFlow}
              describe={(n) => n.role}
              ariaLabel="Illustrative cloud deployment workflow"
            />
            <p className="control__caption">
              Hover, focus or tap a node. A conceptual deployment workflow, not live infrastructure
              telemetry.
            </p>
          </div>
          {chips.map(({ Icon, cls, label }, i) => (
            <span
              key={label}
              className={`chip-float chip-float--${cls}`}
              style={{ animationDuration: `${6 + i}s` }}
              aria-hidden="true"
            >
              <Icon size={16} />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
      <a
        href="#overview"
        className="hero__scroll"
        aria-label="Scroll to overview"
        data-cursor="link"
      >
        <ChevronDown size={20} aria-hidden="true" />
      </a>
    </section>
  );
}

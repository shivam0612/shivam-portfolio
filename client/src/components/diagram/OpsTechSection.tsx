import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lightbulb } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { opsTechFlow } from '../../data/flow';
import { Reveal } from '../animations/Reveal';
import { SectionHeading } from '../common/SectionHeading';
import { FlowDiagram } from './FlowDiagram';

/** Signature section: select a node to read what it does, why it matters, and what is real vs. illustrative. */
export function OpsTechSection() {
  const [selectedId, setSelectedId] = useState(opsTechFlow[1]!.id);
  const panelId = useId();
  const node = opsTechFlow.find((n) => n.id === selectedId) ?? opsTechFlow[0]!;

  return (
    <section id="ops-tech" className="section" aria-labelledby="ops-tech-title">
      <div className="container">
        <SectionHeading
          id="ops-tech-title"
          title={[
            { text: 'Where Operations' },
            'br',
            { text: 'Meets' },
            { text: 'Technology', className: 'gradient-text' },
          ]}
        >
          <p>
            Reliable operations depend on accurate information, efficient processes, capable teams,
            and systems that connect them.
          </p>
        </SectionHeading>

        <Reveal className="ops">
          <div className="ops__diagram panel">
            <p className="ops__hint">Select a step to see how it connects to my experience.</p>
            <FlowDiagram
              mode="select"
              nodes={opsTechFlow}
              selectedId={selectedId}
              onSelect={setSelectedId}
              controlsId={panelId}
              ariaLabel="Operations and technology workflow: warehouse operations, inventory management, order processing, business systems, data and reporting, process improvement"
              cursorLabel="OPEN"
            />
          </div>

          <div
            id={panelId}
            className="ops__detail panel"
            role="region"
            aria-live="polite"
            aria-label={`${node.label} details`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <h3 className="ops__title">{node.label}</h3>
                <dl className="ops__facts">
                  <div>
                    <dt>What it is</dt>
                    <dd>{node.what}</dd>
                  </div>
                  <div>
                    <dt>Why it matters</dt>
                    <dd>{node.why}</dd>
                  </div>
                  <div>
                    <dt>Link to supply chain performance</dt>
                    <dd>{node.relation}</dd>
                  </div>
                </dl>

                <div className="evidence evidence--real">
                  <p className="evidence__tag">
                    <Check size={14} aria-hidden="true" /> From my resume
                  </p>
                  <ul>
                    {node.experience.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  {node.experienceNote && <p className="evidence__note">{node.experienceNote}</p>}
                </div>

                <div className="evidence evidence--idea">
                  <p className="evidence__tag">
                    <Lightbulb size={14} aria-hidden="true" /> Illustrative idea, not something I
                    have implemented
                  </p>
                  <p>{node.illustrative}</p>
                  {node.conceptLink && (
                    <Link to={node.conceptLink.to} className="text-link" data-cursor="link">
                      {node.conceptLink.label}
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

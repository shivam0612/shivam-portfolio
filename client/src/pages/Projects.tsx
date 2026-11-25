import { PageHero } from '../components/common/PageHero';
import { StatusBadge } from '../components/common/StatusBadge';
import { Stagger, StaggerItem } from '../components/animations/Reveal';
import { ProjectCard } from '../components/projects/ProjectCard';
import { projects } from '../data/projects';
import { useSeo } from '../lib/seo';

const legend = [
  ['Concept', 'An idea with a plan. Nothing has been built or verified yet.'],
  ['In Progress', 'Being built. Partial, clearly described implementation exists.'],
  ['Completed', 'Built and verified, with real screenshots.'],
] as const;

export default function Projects() {
  useSeo({
    title: 'Projects',
    path: '/projects',
    description:
      'Project concepts exploring how supply chain and warehouse information could be presented and managed with technology.',
  });
  return (
    <>
      <PageHero title="Projects">
        <p>
          Concepts that explore how operational information could be presented and managed. They are
          labelled with their real status, and none of them is presented as completed professional
          work.
        </p>
      </PageHero>
      <section className="section section--tight">
        <div className="container">
          <dl className="legend">
            {legend.map(([status, text]) => (
              <div key={status}>
                <dt>
                  <StatusBadge status={status} />
                </dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <Stagger className="project-grid project-grid--two">
            {projects.map((p) => (
              <StaggerItem key={p.slug}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

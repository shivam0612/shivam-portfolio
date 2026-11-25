import { projects } from '../../data/projects';
import { Stagger, StaggerItem } from '../animations/Reveal';
import { Button } from '../common/Button';
import { SectionHeading } from '../common/SectionHeading';
import { ProjectCard } from '../projects/ProjectCard';

export function FeaturedProjects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" title="Featured project concepts">
          <p>
            Ideas for how operational information could be presented and managed. Each one is
            labelled with its honest status; none is presented as completed professional work.
          </p>
        </SectionHeading>
        <Stagger className="project-grid">
          {projects.slice(0, 3).map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </Stagger>
        <div className="section__more">
          <Button to="/projects" variant="ghost">
            All projects
          </Button>
        </div>
      </div>
    </section>
  );
}

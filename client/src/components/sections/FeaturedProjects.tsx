import { projects } from '../../data/projects';
import { Stagger, StaggerItem } from '../animations/Reveal';
import { Button } from '../common/Button';
import { SectionHeading } from '../common/SectionHeading';
import { ProjectCard } from '../projects/ProjectCard';

export function FeaturedProjects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" title="Featured projects">
          <p>
            Two completed projects, an AWS deployment and my first Next.js portfolio, plus an idea
            for how operational information could be presented. Each one is labelled with its real
            status.
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

import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../data/types';
import { useSpotlight } from '../../hooks/useSpotlight';
import { Tilt } from '../animations/Tilt';
import { GithubIcon } from '../common/Icons';
import { StatusBadge } from '../common/StatusBadge';
import { ProjectIllustration } from './ProjectIllustration';

/**
 * Whole card is one link (stretched "View Details"), so assistive tech hears a single destination.
 * GitHub / live-demo links render only when real URLs exist in the data file.
 */
export function ProjectCard({ project }: { project: Project }) {
  const spotlight = useSpotlight<HTMLElement>();
  return (
    <Tilt className="project-tilt">
      <article
        className="project spotlight"
        onPointerMove={spotlight}
        data-cursor="card"
        data-cursor-label="EXPLORE"
      >
        <div className="project__art">
          {project.coverImage ? (
            <img
              className="project__shot"
              src={project.coverImage.src}
              alt={project.coverImage.alt}
              width={1919}
              height={1079}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ProjectIllustration kind={project.illustration} />
          )}
          <StatusBadge status={project.status} />
        </div>
        <div className="project__body">
          <p className="project__category">{project.category}</p>
          <h3 className="project__title">{project.title}</h3>
          <p className="project__summary">{project.summary}</p>
          <ul
            className="tags"
            aria-label={`${project.status === 'Concept' ? 'Planned' : 'Core'} technologies`}
          >
            {project.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
          <div className="project__foot">
            <Link
              to={`/projects/${project.slug}`}
              className="project__link"
              aria-label={`View details: ${project.title}`}
            >
              View Details
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            {project.repoUrl && (
              <a
                className="project__ext"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon size={16} className="project__ext-icon" />
                GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                className="project__ext"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </article>
    </Tilt>
  );
}

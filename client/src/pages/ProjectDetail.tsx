import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Reveal } from '../components/animations/Reveal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProjectIllustration } from '../components/projects/ProjectIllustration';
import { getProject } from '../data/projects';
import { useSeo } from '../lib/seo';
import NotFound from './NotFound';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="detail__block" y={12}>
      <h2>{title}</h2>
      {children}
    </Reveal>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProject(slug);
  useSeo({
    title: project?.title ?? 'Project not found',
    path: `/projects/${slug ?? ''}`,
    description: project?.summary,
    noindex: !project,
  });
  if (!project) return <NotFound />;

  const isConcept = project.status === 'Concept';
  return (
    <article className="container detail">
      <Link to="/projects" className="back-link" data-cursor="link">
        <ArrowLeft size={16} aria-hidden="true" />
        All projects
      </Link>

      <header className="detail__head">
        <div className="detail__meta">
          <StatusBadge status={project.status} />
          <span>{project.category}</span>
        </div>
        <h1 className="detail__title">{project.title}</h1>
        <p className="detail__lead">{project.summary}</p>
        {isConcept && (
          <p className="callout" role="note">
            This is a concept. It has not been built, and it is not a completed or professional
            project.
          </p>
        )}
      </header>

      <div className="detail__art panel">
        <ProjectIllustration kind={project.illustration} />
      </div>

      <div className="detail__grid">
        <Block title={isConcept ? 'The problem being explored' : 'The problem'}>
          <p>{project.problem}</p>
        </Block>
        <Block title="Intended users">
          <ul className="bullets">
            {project.users.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </Block>
        <Block title={isConcept ? 'Proposed workflow' : 'Workflow'}>
          <ol className="steps">
            {project.workflow.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ol>
        </Block>
        <Block title={isConcept ? 'Potential features' : 'Features'}>
          <ul className="bullets">
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Block>
        <Block title="Architecture">
          <p>{project.architecture.summary}</p>
          <dl className="layers">
            {project.architecture.layers.map((l) => (
              <div key={l.name}>
                <dt>{l.name}</dt>
                <dd>{l.detail}</dd>
              </div>
            ))}
          </dl>
        </Block>
        <Block title={isConcept ? 'Planned technologies' : 'Technologies used'}>
          <ul className="tags" aria-label="Technologies">
            {project.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </Block>
        <Block title="Implementation status">
          <p>{project.implementationStatus}</p>
        </Block>
        {(isConcept || project.screenshots.length > 0) && (
          <Block title="Screenshots">
            {project.screenshots.length === 0 ? (
              <p className="empty">
                No screenshots yet. They will be added only when a working implementation exists.
                The illustration above is abstract and does not show a real system.
              </p>
            ) : (
              <div className="shots">
                {project.screenshots.map((s) => (
                  <img key={s.src} src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                ))}
              </div>
            )}
          </Block>
        )}
        <Block title="Known limitations">
          <ul className="bullets">
            {project.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Block>
        <Block title="Future improvements">
          <ul className="bullets">
            {project.futureImprovements.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Block>
      </div>

      {(project.repoUrl || project.liveUrl) && (
        <p className="detail__links">
          {project.repoUrl && (
            <a
              className="text-link"
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>
          )}
          {project.liveUrl && (
            <a
              className="text-link"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo
            </a>
          )}
        </p>
      )}
    </article>
  );
}

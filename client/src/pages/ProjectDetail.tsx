import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Reveal } from '../components/animations/Reveal';
import { Button } from '../components/common/Button';
import { GithubIcon } from '../components/common/Icons';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProjectIllustration } from '../components/projects/ProjectIllustration';
import { ScreenshotGallery } from '../components/projects/ScreenshotGallery';
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
  /** A finished project that has no hosted copy yet shows a disabled Live Demo button. */
  const liveDemoPending = project.status === 'Completed' && !project.liveUrl;
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
        {project.coverImage ? (
          <img
            className="detail__shot"
            src={project.coverImage.src}
            alt={project.coverImage.alt}
            width={1919}
            height={1079}
            decoding="async"
          />
        ) : (
          <ProjectIllustration kind={project.illustration} />
        )}
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
          <ScreenshotGallery shots={project.screenshots} />
        </Block>
        <Block title="Implementation status">
          <p>{project.implementationStatus}</p>
        </Block>
        {project.screenshots.length === 0 && (
          <Block title="Screenshots">
            <p className="empty">
              {isConcept
                ? 'No screenshots yet. They will be added only when a working implementation exists. The illustration above is abstract and does not show a real system.'
                : 'Screenshots for this project will be added here soon.'}
            </p>
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

      {(project.repoUrl || project.liveUrl || liveDemoPending) && (
        <div className="detail__links">
          {project.liveUrl && (
            <Button href={project.liveUrl} external icon="external" variant="primary">
              Live Demo
            </Button>
          )}
          {liveDemoPending && (
            <Button variant="primary" icon="none" disabled aria-label="Live demo coming soon">
              Live Demo (coming soon)
            </Button>
          )}
          {project.repoUrl && (
            <Button href={project.repoUrl} external icon="none" variant="ghost">
              <span className="detail__gh">
                <GithubIcon size={18} />
                GitHub
              </span>
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

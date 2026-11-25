import { Button } from '../components/common/Button';
import { useSeo } from '../lib/seo';

export default function NotFound() {
  useSeo({ title: 'Page not found', path: '/404', noindex: true });
  return (
    <section className="container notfound">
      <h1 className="page-hero__title">Page not found</h1>
      <p className="page-hero__lead">That page doesn&apos;t exist, or has moved.</p>
      <div className="notfound__actions">
        <Button to="/">Back to home</Button>
        <Button to="/projects" variant="ghost">
          View projects
        </Button>
      </div>
    </section>
  );
}

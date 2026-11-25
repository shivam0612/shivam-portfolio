import { CareerSpanChart } from '../components/experience/CareerSpanChart';
import { ExperienceTimeline } from '../components/experience/ExperienceTimeline';
import { PageHero } from '../components/common/PageHero';
import { Reveal } from '../components/animations/Reveal';
import { useSeo } from '../lib/seo';

export default function Experience() {
  useSeo({
    title: 'Experience',
    path: '/experience',
    description:
      'Professional experience in warehouse operations, inventory control and team support at Matrix Logistics Services (DHL Supply Chain), Bell Canada and Nestlé / Kellogg.',
  });
  return (
    <>
      <PageHero title="Experience">
        <p>
          Warehouse operations, inventory control and team support. Employers, titles and dates are
          shown exactly as they appear on my resume. Select a role to expand its responsibilities.
        </p>
      </PageHero>
      <section className="section section--tight">
        <div className="container">
          <Reveal>
            <CareerSpanChart />
          </Reveal>
        </div>
      </section>
      <section className="section section--tight" aria-label="Roles">
        <div className="container">
          <ExperienceTimeline />
        </div>
      </section>
    </>
  );
}

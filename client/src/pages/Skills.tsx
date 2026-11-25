import { PageHero } from '../components/common/PageHero';
import { SkillExplorer } from '../components/skills/SkillExplorer';
import { useSeo } from '../lib/seo';

export default function Skills() {
  useSeo({
    title: 'Skills',
    path: '/skills',
    description:
      'Core competencies across warehouse operations, equipment and safety, leadership, technology and business systems, and process improvement.',
  });
  return (
    <>
      <PageHero title="Skills">
        <p>
          Five areas of competency. There are no ratings or percentages here: every card says what
          my resume states that supports it, and the technology list reflects tools I have used and
          my computer science education.
        </p>
      </PageHero>
      <section className="section section--tight">
        <div className="container">
          <SkillExplorer initial="all" />
        </div>
      </section>
    </>
  );
}

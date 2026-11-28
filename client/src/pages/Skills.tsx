import { PageHero } from '../components/common/PageHero';
import { SkillExplorer } from '../components/skills/SkillExplorer';
import { useSeo } from '../lib/seo';

export default function Skills() {
  useSeo({
    title: 'Skills',
    path: '/skills',
    description:
      'AWS cloud infrastructure, DevOps and deployment, full-stack software development, databases, AI/ML, and complementary professional experience.',
  });
  return (
    <>
      <PageHero title="Skills">
        <p>
          Seven areas of competency. There are no ratings or percentages here: every card says what
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

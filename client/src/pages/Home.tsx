import { EducationCertifications } from '../components/education/EducationCertifications';
import { OpsTechSection } from '../components/diagram/OpsTechSection';
import { ExperienceTimeline } from '../components/experience/ExperienceTimeline';
import { Button } from '../components/common/Button';
import { SectionHeading } from '../components/common/SectionHeading';
import { Hero } from '../components/hero/Hero';
import { AboutPreview } from '../components/sections/AboutPreview';
import { ContactCta } from '../components/sections/ContactCta';
import { FeaturedProjects } from '../components/sections/FeaturedProjects';
import { OverviewSection } from '../components/sections/OverviewSection';
import { SkillExplorer } from '../components/skills/SkillExplorer';
import { personJsonLd, useSeo } from '../lib/seo';

export default function Home() {
  useSeo({ path: '/', jsonLd: personJsonLd() });
  return (
    <>
      <Hero />
      <OverviewSection />
      <AboutPreview />
      <section id="skills" className="section" aria-labelledby="skills-title">
        <div className="container">
          <SectionHeading id="skills-title" title="Core competencies">
            <p>
              Grouped by area. Each card cites what my resume says that supports it, with no ratings
              or percentages.
            </p>
          </SectionHeading>
          <SkillExplorer initial="warehouse" />
          <div className="section__more">
            <Button to="/skills" variant="ghost">
              See every competency
            </Button>
          </div>
        </div>
      </section>
      <section id="experience" className="section" aria-labelledby="experience-title">
        <div className="container">
          <SectionHeading id="experience-title" title="Professional experience">
            <p>
              Roles and dates are shown exactly as they appear on my resume. Select a role to expand
              its responsibilities.
            </p>
          </SectionHeading>
          <ExperienceTimeline />
          <div className="section__more">
            <Button to="/experience" variant="ghost">
              Experience in detail
            </Button>
          </div>
        </div>
      </section>
      <OpsTechSection />
      <FeaturedProjects />
      <EducationCertifications />
      <ContactCta />
    </>
  );
}

import { EducationCertifications } from '../components/education/EducationCertifications';
import { Reveal, Stagger, StaggerItem } from '../components/animations/Reveal';
import { Button } from '../components/common/Button';
import { PageHero } from '../components/common/PageHero';
import { SectionHeading } from '../components/common/SectionHeading';
import { profile } from '../data/profile';
import { useSeo } from '../lib/seo';

const operations = [
  [
    'Warehouse fulfillment',
    'Accurate, efficient fulfillment of customer orders while maintaining quality and safety standards.',
  ],
  ['Replenishment', 'Applying DC30 process knowledge to keep pick locations supplied.'],
  ['Shorts resolution', 'Managing shorts and inventory control processes using DALLAS software.'],
  ['Selection processes', 'Identifying and correcting mispicks and selection errors.'],
  [
    'Inventory control',
    'Keeping records and physical stock aligned, with a reported 99% accuracy in inventory management and order processing at Nestlé / Kellogg.',
  ],
  ['Order accuracy', 'Quality checks as part of everyday fulfillment work.'],
  [
    'Material handling equipment',
    'Operating pallet jacks, cherry pickers, and Reach Trucks safely and efficiently.',
  ],
  ['Safety compliance', 'Promoting safety protocols and working within safety standards.'],
  ['Training new associates', 'Supporting onboarding and helping associates build productivity.'],
  [
    'Operational documentation',
    'Maintaining documentation for audits, compliance, and inventory tracking.',
  ],
] as const;

const tools = ['DALLAS', 'Microsoft Office', 'Microsoft Project', 'Salesforce', 'Google Docs'];

const leadership = [
  [
    'Communication',
    'Helping customers choose suitable products at Bell Canada and guiding associates on the warehouse floor.',
  ],
  ['Training and support', 'Supporting the onboarding and training of new associates.'],
  [
    'Teamwork',
    'Guiding a team of approximately four to five associates on customer engagement and sales strategies.',
  ],
  [
    'Operational discipline',
    'Recognized in performance reviews for attendance, productivity, and operational knowledge.',
  ],
  [
    'Problem-solving',
    'Finding and correcting mispicks, resolving shorts, and adapting across warehouse functions.',
  ],
  ['Safety awareness', 'Promoting safety protocols and safe equipment operation.'],
  [
    'Continuous improvement',
    'Contributing to process efficiency, and interested in KPI performance and continuous improvement.',
  ],
] as const;

export default function About() {
  useSeo({
    title: 'About',
    path: '/about',
    description:
      'How a computer science education and hands-on warehouse operations experience come together in Shivam Patel’s professional background.',
  });
  return (
    <>
      <PageHero title="About">
        <p>
          My background combines computer science education with hands-on experience in warehouse
          operations, inventory management, customer service, and team support.
        </p>
      </PageHero>

      <section className="section section--tight">
        <div className="container prose prose--wide">
          {profile.summaryFull.map((p) => (
            <Reveal key={p}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="ops-title">
        <div className="container">
          <SectionHeading id="ops-title" title="Operations experience">
            <p>The day-to-day work behind the summary, as described on my resume.</p>
          </SectionHeading>
          <Stagger className="fact-grid">
            {operations.map(([t, d]) => (
              <StaggerItem key={t}>
                <div className="fact">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section" aria-labelledby="tech-title">
        <div className="container split">
          <SectionHeading id="tech-title" title="Technology background">
            <p>
              I hold a postgraduate degree in computer science (2023), a bachelor’s degree in
              computer science and engineering (2017), and a diploma in computer science and
              engineering (2014).
            </p>
          </SectionHeading>
          <Reveal className="prose">
            <p>The business software listed on my resume:</p>
            <ul className="tags tags--lg" aria-label="Business software">
              {tools.map((t) => (
                <li key={t} className="tag tag--tech">
                  {t}
                </li>
              ))}
            </ul>
            <p className="callout">
              These are tools I have used in my roles. I am not claiming software development
              experience with these systems; the technical depth on this site comes from my
              education and from how operational information is used day to day.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="lead-title">
        <div className="container">
          <SectionHeading id="lead-title" title="Leadership approach" />
          <Stagger className="fact-grid">
            {leadership.map(([t, d]) => (
              <StaggerItem key={t}>
                <div className="fact">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section" aria-labelledby="dir-title">
        <div className="container split">
          <SectionHeading id="dir-title" title="Professional direction" />
          <Reveal className="prose">
            <p>
              I am interested in contributing to safe, efficient warehouse operations, team
              development, KPI performance, and continuous improvement, and in combining operational
              leadership with supply chain knowledge, business systems, and technology-enabled
              improvement.
            </p>
            <p>
              I am early in applying technology to operations. The project concepts on this site are
              a way of exploring how information could be presented and managed; they are labelled
              honestly as concepts, not as delivered work.
            </p>
            <div className="prose__cta">
              <Button to="/projects">See the project concepts</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <EducationCertifications />
    </>
  );
}

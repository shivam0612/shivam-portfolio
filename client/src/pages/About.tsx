import { EducationCertifications } from '../components/education/EducationCertifications';
import { Reveal, Stagger, StaggerItem } from '../components/animations/Reveal';
import { Button } from '../components/common/Button';
import { PageHero } from '../components/common/PageHero';
import { SectionHeading } from '../components/common/SectionHeading';
import { profile } from '../data/profile';
import { useSeo } from '../lib/seo';

const technicalFocus = [
  [
    'AWS cloud infrastructure',
    'AWS Lightsail, Amazon ECR, Ubuntu, Cloudflare DNS, HTTPS, and Caddy reverse proxy configuration.',
  ],
  [
    'DevOps & deployment',
    'Docker, Docker Compose, PowerShell automation, AWS CLI, SSH, deployment health checks, and rollback handling.',
  ],
  [
    'Software development',
    'JavaScript, TypeScript, Python, React, Node.js, REST APIs, and full-stack application development.',
  ],
  [
    'Databases & systems',
    'PostgreSQL, Prisma, MongoDB, MongoDB Atlas, Linux, DNS, and networking fundamentals.',
  ],
  [
    'AI & machine learning',
    'ANN, CNN, transfer learning, computer vision, and data visualization from internship project work.',
  ],
] as const;

const professionalExperience = [
  {
    role: 'Software Engineering Team Lead',
    company: 'Lambton College',
    detail:
      'Led five developers, architected and deployed a MERN application, conducted 45+ code reviews, integrated third-party APIs, and achieved 85% unit test coverage.',
  },
  {
    role: 'Team Member',
    company: 'Matrix Logistics Services (DHL Supply Chain)',
    detail:
      'Managed inventory, investigated shortages, corrected mispicks using DALLAS warehouse software, monitored accuracy and productivity KPIs, and supported onboarding and audit documentation.',
  },
  {
    role: 'Team Leader / Sales Supervisor',
    company: 'Bell Canada',
    detail:
      'Led 5–6 sales associates, coached team performance, onboarded new staff, prepared monthly sales reports, used Salesforce, and achieved an 80% sales increase within four weeks through upselling and cross-selling.',
  },
  {
    role: 'Web Development & Artificial Intelligence Intern',
    company: 'Verzeo',
    detail:
      'Delivered client-facing web projects, developed React/Node applications and data visualizations, and completed AI/ML projects including face-mask detection and image captioning.',
  },
] as const;

export default function About() {
  useSeo({
    title: 'About',
    path: '/about',
    description:
      'Shivam Patel is a Computer Science graduate and AWS-certified cloud practitioner with hands-on cloud deployment, DevOps, full-stack development, and team leadership experience.',
  });

  return (
    <>
      <PageHero title="About">
        <p>
          I am a Computer Science graduate working across AWS Cloud, DevOps, and software
          engineering. Alongside hands-on cloud deployment and application development, I bring team
          leadership, coaching, and a genuine interest in mentoring others and sharing technical
          knowledge.
        </p>
      </PageHero>

      <section className="section section--tight">
        <div className="container prose prose--wide">
          {profile.summaryFull.map((paragraph) => (
            <Reveal key={paragraph}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="focus-title">
        <div className="container">
          <SectionHeading id="focus-title" title="Technical focus">
            <p>
              Practical technologies used in my cloud deployment and software projects, alongside
              skills developed through my Computer Science education and internships.
            </p>
          </SectionHeading>
          <Stagger className="fact-grid">
            {technicalFocus.map(([title, detail]) => (
              <StaggerItem key={title}>
                <div className="fact">
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="prose__cta">
            <Button to="/skills">Explore technical skills</Button>
            <Button to="/projects" variant="ghost">
              View cloud project
            </Button>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="experience-title">
        <div className="container">
          <SectionHeading id="experience-title" title="Professional experience">
            <p>
              My experience extends beyond warehouse operations. It includes software engineering,
              cloud-focused project work, customer-facing technology sales, and team leadership.
            </p>
          </SectionHeading>
          <Stagger className="fact-grid">
            {professionalExperience.map((item) => (
              <StaggerItem key={item.company}>
                <div className="fact">
                  <p className="eyebrow">{item.company}</p>
                  <h3>{item.role}</h3>
                  <p>{item.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="prose__cta">
            <Button to="/experience">View full experience</Button>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="direction-title">
        <div className="container split">
          <SectionHeading id="direction-title" title="Career direction" />
          <Reveal className="prose">
            <p>
              I am pursuing opportunities across AWS Cloud Engineering, Cloud Support, DevOps, and
              software engineering, including full-stack and backend development roles. My hands-on
              foundation includes deploying a containerized full-stack application, publishing
              images to Amazon ECR, managing an AWS Lightsail environment, configuring HTTPS and
              DNS, and automating deployments.
            </p>
            <p>
              I also welcome opportunities to mentor, coach, onboard, and share knowledge with
              teammates. My software engineering team-lead experience at Lambton College, together
              with training and coaching at Bell Canada and Matrix Logistics Services, supports this
              people-focused side of my professional profile. I value helping others build
              confidence and grow.
            </p>
          </Reveal>
        </div>
      </section>

      <EducationCertifications />
    </>
  );
}

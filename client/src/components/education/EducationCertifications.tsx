import { Award, GraduationCap } from 'lucide-react';
import { certifications } from '../../data/certifications';
import { education } from '../../data/education';
import { useSpotlight } from '../../hooks/useSpotlight';
import { Reveal, Stagger, StaggerItem } from '../animations/Reveal';
import { SectionHeading } from '../common/SectionHeading';

function Card({ children }: { children: React.ReactNode }) {
  const spotlight = useSpotlight<HTMLDivElement>();
  return (
    <div className="edu-card spotlight" onPointerMove={spotlight}>
      {children}
    </div>
  );
}

export function EducationCertifications() {
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <div className="container">
        <SectionHeading id="education-title" title="Education and certifications">
          <p>
            A computer science education from diploma to postgraduate level sits alongside practical
            operations experience, so system concepts and day-to-day warehouse work inform each
            other.
          </p>
        </SectionHeading>

        <h3 className="subhead">Education</h3>
        <Stagger className="edu-grid">
          {education.map((e) => (
            <StaggerItem key={e.degree}>
              <Card>
                <GraduationCap
                  className="edu-card__icon"
                  size={22}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <p className="edu-card__year">{e.year}</p>
                <h4 className="edu-card__title">{e.degree}</h4>
                <p className="edu-card__sub">{e.institution}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>

        <h3 className="subhead">Certifications and qualifications</h3>
        <Stagger className="edu-grid">
          {certifications.map((c) => (
            <StaggerItem key={c.name}>
              <Card>
                <Award className="edu-card__icon" size={22} strokeWidth={1.6} aria-hidden="true" />
                <h4 className="edu-card__title">{c.name}</h4>
                <p className="edu-card__sub">
                  <span className="edu-card__label">{c.issuerLabel}:</span> {c.issuer}
                </p>
                {c.note && <p className="edu-card__note">{c.note}</p>}
                {c.expiry && (
                  <p className="edu-card__note">
                    <span className="edu-card__label">Expiry:</span> {c.expiry}
                  </p>
                )}
                {c.credentialUrl && (
                  <a
                    className="text-link"
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential
                  </a>
                )}
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <p className="footnote">Listed as they appear on the resume.</p>
        </Reveal>
      </div>
    </section>
  );
}

import { profile } from '../../data/profile';
import { Reveal } from '../animations/Reveal';
import { Button } from '../common/Button';
import { SectionHeading } from '../common/SectionHeading';

export function AboutPreview() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container split">
        <div>
          <SectionHeading
            id="about-title"
            title={[
              { text: 'Computer' },
              { text: 'science' },
              { text: 'education,' },
              'br',
              { text: 'warehouse-floor' },
              { text: 'experience.' },
            ]}
          >
            <p>{profile.supportingStatement}</p>
          </SectionHeading>
        </div>
        <Reveal className="prose">
          <p>{profile.summaryFull[1]}</p>
          <p>{profile.summaryFull[2]}</p>
          <p>{profile.summaryFull[3]}</p>
          <div className="prose__cta">
            <Button to="/about" variant="ghost">
              Read the full story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

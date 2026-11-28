import { Cpu, Users, Warehouse } from 'lucide-react';
import { certifications } from '../../data/certifications';
import { education } from '../../data/education';
import { profile } from '../../data/profile';
import { skillCategories } from '../../data/skills';
import { useSpotlight } from '../../hooks/useSpotlight';
import { Counter } from '../animations/Counter';
import { Reveal, Stagger, StaggerItem } from '../animations/Reveal';
import { SectionHeading } from '../common/SectionHeading';

const identities = [
  {
    Icon: Warehouse,
    title: 'Supply chain & warehouse operations',
    text: 'DC30 Replenishment, Shorts resolution and Selection, inventory control, order accuracy and safe use of material handling equipment.',
  },
  {
    Icon: Cpu,
    title: 'Information technology & computer science',
    text: 'A postgraduate degree, a bachelor’s degree and a diploma in computer science, plus working use of DALLAS, Salesforce and Microsoft Office.',
  },
  {
    Icon: Users,
    title: 'Operations leadership & continuous improvement',
    text: 'Training and supporting new associates, guiding a small team, and a stated interest in KPI performance and continuous improvement.',
  },
] as const;

const metrics = [
  {
    value: 4,
    suffix: '+',
    label: 'Years of hands-on experience',
    note: 'Stated in the resume summary',
  },
  {
    value: education.length,
    suffix: '',
    label: 'Education credentials',
    note: 'Diploma, bachelor’s and postgraduate',
  },
  {
    value: certifications.length,
    suffix: '',
    label: 'Listed certifications and qualifications',
    note: 'AWS and supply chain credentials',
  },
  {
    value: skillCategories.length,
    suffix: '',
    label: 'Core competency categories',
    note: 'Cloud, DevOps, development, data, AI, leadership, operations',
  },
] as const;

function IdentityCard({ Icon, title, text }: (typeof identities)[number]) {
  const spotlight = useSpotlight<HTMLDivElement>();
  return (
    <div className="identity spotlight" onPointerMove={spotlight}>
      <span className="identity__icon">
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function OverviewSection() {
  return (
    <section id="overview" className="section" aria-labelledby="overview-title">
      <div className="container">
        <SectionHeading
          id="overview-title"
          title={[
            { text: 'Operations,' },
            { text: 'systems' },
            { text: 'and' },
            { text: 'people.' },
          ]}
        >
          <p>{profile.summaryShort}</p>
        </SectionHeading>

        <Stagger className="identities">
          {identities.map((i) => (
            <StaggerItem key={i.title}>
              <IdentityCard {...i} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal>
          <dl className="metrics">
            {metrics.map((m) => (
              <div className="metric" key={m.label}>
                <dt>{m.label}</dt>
                <dd className="metric__value">
                  <Counter to={m.value} suffix={m.suffix} />
                </dd>
                <dd className="metric__note">{m.note}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

import { Mail, Phone } from 'lucide-react';
import { profile } from '../../data/profile';
import { Magnetic } from '../animations/Magnetic';
import { Reveal } from '../animations/Reveal';
import { Button } from '../common/Button';

export function ContactCta() {
  return (
    <section id="contact" className="section" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta panel">
          <h2 id="cta-title" className="cta__title">
            Let&apos;s build something meaningful.
          </h2>
          <p className="cta__lead">
            Whether the conversation is about supply chain operations, operational leadership,
            process improvement, or technology, I&apos;d be happy to connect.
          </p>
          <div className="cta__actions">
            <Magnetic>
              <Button to="/contact" cursorLabel="CONNECT">
                Send a message
              </Button>
            </Magnetic>
            <a className="cta__link" href={`mailto:${profile.contact.email}`} data-cursor="link">
              <Mail size={18} aria-hidden="true" />
              {profile.contact.email}
            </a>
            <a className="cta__link" href={profile.contact.phoneHref} data-cursor="link">
              <Phone size={18} aria-hidden="true" />
              {profile.contact.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { footerLinks } from '../../data/navigation';
import { profile } from '../../data/profile';
import { SocialLinks } from '../common/SocialLinks';

const motifPoints = [40, 190, 360, 520, 700, 880, 1040, 1160];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__motif" aria-hidden="true">
        <svg viewBox="0 0 1200 2" preserveAspectRatio="none" focusable="false">
          <path className="footer__line" d="M0 1 H1200" />
          <path className="footer__line footer__line--flow" d="M0 1 H1200" />
        </svg>
        {motifPoints.map((x, i) => (
          <i
            key={x}
            className={`footer__node${i % 3 === 0 ? ' footer__node--lg' : ''}`}
            style={{ left: `${(x / 1200) * 100}%` }}
          />
        ))}
      </div>
      <div className="container footer__grid">
        <div className="footer__brand">
          <p className="footer__name">{profile.name}</p>
          <p className="footer__tag">Supply Chain × Technology</p>
        </div>

        <nav aria-label="Footer" className="footer__nav">
          <ul>
            {footerLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} data-cursor="link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="footer__contact">
          <li>
            <Mail size={16} aria-hidden="true" />
            <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
          </li>
          <li>
            <Phone size={16} aria-hidden="true" />
            <a href={profile.contact.phoneHref}>{profile.contact.phone}</a>
          </li>
          {profile.location && (
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>{profile.location}</span>
            </li>
          )}
          <li>
            <SocialLinks />
          </li>
        </ul>
      </div>
      <div className="container footer__base">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
}

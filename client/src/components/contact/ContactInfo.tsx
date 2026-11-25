import { Mail, MapPin, Phone } from 'lucide-react';
import { profile } from '../../data/profile';
import { SocialLinks } from '../common/SocialLinks';
import { ResumeButton } from '../common/ResumeButton';

export function ContactInfo() {
  return (
    <div className="contact-info">
      <h1 className="contact-info__title">Let&apos;s build something meaningful.</h1>
      <p className="contact-info__lead">
        Whether the conversation is about supply chain operations, operational leadership, process
        improvement, or technology, I&apos;d be happy to connect.
      </p>
      <ul className="contact-list">
        <li>
          <Mail size={20} aria-hidden="true" />
          <div>
            <span className="contact-list__label">Email</span>
            <a href={`mailto:${profile.contact.email}`} data-cursor="link">
              {profile.contact.email}
            </a>
          </div>
        </li>
        <li>
          <Phone size={20} aria-hidden="true" />
          <div>
            <span className="contact-list__label">Phone</span>
            <a href={profile.contact.phoneHref} data-cursor="link">
              {profile.contact.phone}
            </a>
          </div>
        </li>
        {profile.location && (
          <li>
            <MapPin size={20} aria-hidden="true" />
            <div>
              <span className="contact-list__label">Location</span>
              <span>{profile.location}</span>
            </div>
          </li>
        )}
      </ul>
      <SocialLinks className="contact-info__social" />
      <div className="contact-info__resume">
        <ResumeButton variant="ghost" />
      </div>
    </div>
  );
}

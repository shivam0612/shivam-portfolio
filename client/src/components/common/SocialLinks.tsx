import { profile } from '../../data/profile';
import { GithubIcon, LinkedinIcon } from './Icons';

/** Renders only the profile links that are actually configured. Returns null when there are none. */
export function SocialLinks({ className = '' }: { className?: string }) {
  const { linkedin, github } = profile.social;
  if (!linkedin && !github) return null;
  return (
    <ul className={`social ${className}`.trim()} aria-label="Social profiles">
      {linkedin && (
        <li>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn (opens in a new tab)"
            data-cursor="link"
          >
            <LinkedinIcon />
          </a>
        </li>
      )}
      {github && (
        <li>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in a new tab)"
            data-cursor="link"
          >
            <GithubIcon />
          </a>
        </li>
      )}
    </ul>
  );
}

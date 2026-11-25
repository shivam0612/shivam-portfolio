import { profile } from '../../data/profile';
import { Button } from './Button';

/** Renders nothing unless a real resume file was found in client/public/resume/ at build time. */
export function ResumeButton({ variant = 'quiet' }: { variant?: 'primary' | 'ghost' | 'quiet' }) {
  if (!profile.resumeUrl) return null;
  const ext = profile.resumeUrl.split('.').pop();
  return (
    <Button
      href={profile.resumeUrl}
      download={`${profile.resumeFilename}.${ext}`}
      variant={variant}
      icon="download"
    >
      Download Resume
    </Button>
  );
}

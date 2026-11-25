import { CircleCheck, Hammer, Lightbulb } from 'lucide-react';
import type { ProjectStatus } from '../../data/types';

const config = {
  Concept: { Icon: Lightbulb, cls: 'concept' },
  'In Progress': { Icon: Hammer, cls: 'progress' },
  Completed: { Icon: CircleCheck, cls: 'done' },
} as const;

/** Status is conveyed by icon + text, never by colour alone. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { Icon, cls } = config[status];
  return (
    <span className={`status status--${cls}`}>
      <Icon size={14} aria-hidden="true" />
      {status}
    </span>
  );
}

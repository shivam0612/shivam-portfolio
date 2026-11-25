import {
  ChartColumn,
  Boxes,
  Cpu,
  Database,
  PackageCheck,
  ShieldCheck,
  Users,
  Warehouse,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { FlowIcon } from '../../data/flow';
import type { SkillCategory } from '../../data/types';

export const categoryIcons: Record<SkillCategory['icon'], LucideIcon> = {
  warehouse: Warehouse,
  shield: ShieldCheck,
  users: Users,
  cpu: Cpu,
  workflow: Workflow,
};

export const flowIcons: Record<FlowIcon, LucideIcon> = {
  warehouse: Warehouse,
  boxes: Boxes,
  package: PackageCheck,
  database: Database,
  chart: ChartColumn,
  workflow: Workflow,
};

/** Route-level code splitting. The same loaders feed React.lazy and the intro's readiness check. */
export const loaders = {
  home: () => import('./Home'),
  about: () => import('./About'),
  experience: () => import('./Experience'),
  projects: () => import('./Projects'),
  projectDetail: () => import('./ProjectDetail'),
  skills: () => import('./Skills'),
  contact: () => import('./Contact'),
  privacy: () => import('./Privacy'),
  notFound: () => import('./NotFound'),
} as const;

export function preloadRoute(pathname: string): Promise<unknown> {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return loaders.home();
  if (p.startsWith('/projects/')) return loaders.projectDetail();
  const key = p.slice(1) as keyof typeof loaders;
  return key in loaders ? loaders[key]() : loaders.notFound();
}

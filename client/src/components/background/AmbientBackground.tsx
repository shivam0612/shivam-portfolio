/** Fixed, GPU-cheap backdrop: fine grid plus two slow gradient orbs (no blur filters, transform-only motion). */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__grid" />
      <div className="ambient__orb ambient__orb--a" />
      <div className="ambient__orb ambient__orb--b" />
    </div>
  );
}

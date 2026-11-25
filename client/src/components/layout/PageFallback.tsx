/** Shown only while a route's code is loading. Intentionally minimal. */
export function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-label="Loading page">
      <span className="page-fallback__bar" />
    </div>
  );
}

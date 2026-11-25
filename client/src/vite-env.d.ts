/// <reference types="vite/client" />

/** Injected by vite.config.ts: "" when no resume file exists in public/resume/. */
declare const __RESUME_URL__: string;

interface ImportMetaEnv {
  /** Public origin of the deployed site, e.g. https://example.com (no trailing slash). */
  readonly VITE_SITE_URL?: string;
  /** API origin when the API is hosted separately, e.g. https://api.example.com. Empty = same origin. */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_LINKEDIN_URL?: string;
  readonly VITE_GITHUB_URL?: string;
  readonly VITE_LOCATION?: string;
  readonly VITE_SHOW_AVAILABILITY?: string;
  readonly VITE_OG_IMAGE_URL?: string;
  readonly VITE_DISABLE_INTRO?: string;
  readonly VITE_DEV_API_TARGET?: string;
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { projects } from './src/data/projects';

const root = path.dirname(fileURLToPath(import.meta.url));

/** The resume button only exists when a real file has been dropped into public/resume/. */
function findResume(): string {
  for (const name of ['Shivam_Patel_Resume.pdf', 'Shivam_Patel_Resume.docx']) {
    if (fs.existsSync(path.join(root, 'public', 'resume', name))) return `/resume/${name}`;
  }
  return '';
}

/**
 * SEO files that depend on the (configurable) production domain. Nothing is emitted or injected
 * when VITE_SITE_URL is unset, so an invented domain never ends up in canonical URLs.
 */
function seoPlugin(siteUrl: string, ogImage: string): Plugin {
  const routes = ['/', '/about', '/experience', '/projects', '/skills', '/contact', '/privacy'];
  routes.push(...projects.map((p) => `/projects/${p.slug}`));
  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      if (!siteUrl) return html;
      const image = ogImage || `${siteUrl}/og-image.png`;
      return html.replace(
        '</head>',
        [
          `  <link rel="canonical" href="${siteUrl}/" />`,
          `  <meta property="og:url" content="${siteUrl}/" />`,
          `  <meta property="og:image" content="${image}" />`,
          `  <meta name="twitter:image" content="${image}" />`,
          '</head>',
        ].join('\n'),
      );
    },
    closeBundle() {
      if (!siteUrl) return;
      const dist = path.join(root, 'dist');
      if (!fs.existsSync(dist)) return;
      const today = new Date().toISOString().slice(0, 10);
      const urls = routes
        .map(
          (r) =>
            `  <url><loc>${siteUrl}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`,
        )
        .join('\n');
      fs.writeFileSync(
        path.join(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      fs.writeFileSync(
        path.join(dist, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VITE_');
  const siteUrl = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');
  return {
    plugins: [react(), seoPlugin(siteUrl, (env.VITE_OG_IMAGE_URL ?? '').trim())],
    define: { __RESUME_URL__: JSON.stringify(findResume()) },
    server: {
      port: 5173,
      proxy: { '/api': { target: env.VITE_DEV_API_TARGET || 'http://localhost:4000' } },
    },
    preview: {
      port: 4173,
      proxy: { '/api': { target: env.VITE_DEV_API_TARGET || 'http://localhost:4000' } },
    },
    build: { target: 'es2022', sourcemap: false },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/test/**/*.test.{ts,tsx}'],
      css: false,
    },
  };
});

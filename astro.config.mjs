// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Production architecture: TECHNICAL_ARCHITECTURE.md
 *   §3   stack — Astro 5, output: 'static', islands
 *   §6.1 rendering — 100% static prerendering, no SSR/ISR/edge rendering
 *   §11  i18n — RO at root, EN under /en/ (IA §2.2; DECISIONS_LOG #21, #77)
 *
 * Astro's i18n gives locale *prefixing* only. It does NOT translate path
 * segments — localized segments come from the frozen locale route map in
 * `src/lib/i18n/routes.ts` (§11.1). Do not duplicate route strings here.
 *
 * `site` is intentionally absent: the production custom domain is not decided
 * in any authoritative document. It is required before canonical URLs, hreflang
 * and sitemap emission (§12) can be built.
 */
export default defineConfig({
  output: 'static',
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

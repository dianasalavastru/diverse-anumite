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

  /**
   * §19.1: the Content-Security-Policy carries "no `unsafe-inline` in
   * `script-src`".
   *
   * Astro inlines any bundled script below Vite's `assetsInlineLimit` (4 KB by
   * default) straight into the HTML. Both of this site's scripts — the motion
   * runtime and the focus-carousel island — are well under that, so the default
   * build emitted them as inline `<script type="module">` blocks, which cannot
   * load under the mandated CSP without `unsafe-inline` or per-page hashes.
   *
   * Setting the limit to 0 emits them as external modules instead. The cost is
   * one cached request per script; the alternative is either weakening the CSP
   * or generating a hash allowlist per page, and §19.1 is not negotiable.
   *
   * BaseLayout.astro already avoids the other inline script the HiFi uses (the
   * pre-paint `anim-load` class) by rendering that class server-side.
   */
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },

  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

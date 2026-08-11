/// <reference types="vitest" />

/**
 * ── AMENDED AT THE SERVICE PAGE BUILD (A7) ─────────────────────────────────
 *
 * `defineConfig` from `vitest/config` cannot transform `.astro` files: Vite has
 * no Astro plugin under a plain config, so importing a component into a test
 * fails at import-analysis. `getViteConfig` is Astro's own documented wrapper —
 * it returns the project's real Vite config (the same plugin set the build
 * uses) with the Vitest test options merged in.
 *
 * This is a SHARED file, so the change is deliberately the minimum that makes
 * component rendering possible, and it changes nothing about which tests run:
 * `include` and `environment` are carried over verbatim. Every pre-existing
 * suite is pure TypeScript and is unaffected.
 *
 * Why it was needed: the Service page must be proven in states the Sanity
 * dataset cannot currently supply — a Reality Capture service with demonstrating
 * work whose survey is published and cleared (§10.4, §19.4), and an
 * EN-unpublished service (§11.2 rule 7). Neither exists in the dataset, so
 * neither appears in build output, and asserting them needs the components
 * rendered directly (`src/components/service/render.test.ts`).
 */

import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});

/**
 * CMS connection configuration — pinned, validated, secret-free.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §18, §18.1.
 *
 * Nothing here holds a value: this module declares *which* environment variables carry the
 * connection and reads them at build time. `.env.example` in the repository root lists the
 * same names with no values (§18). No secret ever enters Git; no secret ever reaches the
 * browser — this module is imported only by the build-time query layer.
 */

/**
 * PINNED API VERSION (§8: "All queries pin `apiVersion` and `perspective: 'published'`").
 *
 * Verified against Sanity's HTTP API reference 2026-08-11: the query endpoint is
 * `GET https://<projectId>.api.sanity.io/v<apiVersion>/data/query/<dataset>`, and the default
 * perspective changed from `raw` to `published` at exactly this version. §8's statement is
 * accurate. We pin the version *and* send the perspective explicitly, because relying on a
 * vendor default is precisely the failure mode §18's "Consequence to respect" warns about:
 * a Viewer token can read drafts, so `published` must be asserted, never assumed.
 */
export const SANITY_API_VERSION = '2025-02-19';

/** The only perspective production may use (§8). Enforced by `assertProductionPerspective`. */
export const PRODUCTION_PERSPECTIVE = 'published';

/**
 * Perspectives the vendor accepts (verified 2026-08-11). `previewDrafts` is the deprecated
 * former name of `drafts` and is deliberately not offered.
 */
export type Perspective = 'published' | 'drafts' | 'raw';

/**
 * Sanity's documented ceiling for GET queries. Exceeding it is a vendor error, not a content
 * error, so the client fails loudly rather than truncating.
 */
export const MAX_GET_QUERY_BYTES = 11 * 1024;

/** Environment variable names. Values live in CI/build secrets only (§18). */
export const ENV = {
  projectId: 'SANITY_PROJECT_ID',
  dataset: 'SANITY_DATASET',
  /** Read-only **Viewer** token, build environment only. Never a write/Editor token (§18). */
  readToken: 'SANITY_READ_TOKEN',
} as const;

export interface SanityConfig {
  readonly projectId: string;
  readonly dataset: string;
  readonly apiVersion: string;
  readonly perspective: Perspective;
  readonly token: string;
}

export class ContentConfigError extends Error {
  override readonly name = 'ContentConfigError';
}

/**
 * Production reads use `api.sanity.io`, **not** `apicdn.sanity.io`.
 *
 * The CDN host serves a cached response. The build is triggered by the publish webhook (§4),
 * so a cached read is exactly the window in which the build would emit the *previous*
 * revision of the document the editor just published. Freshness is worth more than latency
 * for a build that runs a few times a day.
 */
export function queryUrlBase(config: SanityConfig): string {
  return `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`;
}

/**
 * §8, R2: production output may never contain a draft. The perspective is the first of three
 * defences (the others are the pinned API version and the build-time draft assertion in
 * `normalize.ts`).
 */
export function assertProductionPerspective(perspective: Perspective): void {
  if (perspective !== PRODUCTION_PERSPECTIVE) {
    throw new ContentConfigError(
      `Production reads must use perspective '${PRODUCTION_PERSPECTIVE}' (TECHNICAL_ARCHITECTURE.md §8). Refusing '${perspective}'.`,
    );
  }
}

/**
 * Resolve the connection from an environment bag. Explicit parameter rather than a direct
 * `process.env` read so this stays pure and testable, and so no module-load side effect can
 * make a component accidentally depend on CMS credentials.
 *
 * `perspective` is a parameter with a production default: the preview environment (§6.2) is
 * the *only* caller permitted to pass anything else, and it runs with its own separate,
 * server-side draft token — never this one.
 */
export function resolveSanityConfig(
  env: Record<string, string | undefined>,
  perspective: Perspective = PRODUCTION_PERSPECTIVE,
): SanityConfig {
  const projectId = env[ENV.projectId]?.trim();
  const dataset = env[ENV.dataset]?.trim();
  const token = env[ENV.readToken]?.trim();

  const missing: string[] = [];
  if (!projectId) missing.push(ENV.projectId);
  if (!dataset) missing.push(ENV.dataset);
  if (!token) missing.push(ENV.readToken);

  if (missing.length > 0) {
    throw new ContentConfigError(
      `Missing CMS environment variable(s): ${missing.join(', ')}. See .env.example (TECHNICAL_ARCHITECTURE.md §18).`,
    );
  }

  return {
    projectId: projectId as string,
    dataset: dataset as string,
    apiVersion: SANITY_API_VERSION,
    perspective,
    token: token as string,
  };
}

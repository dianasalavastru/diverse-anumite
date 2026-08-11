/**
 * Sanity transport — the only module in the repository that talks to the CMS over the wire.
 *
 * OWNER: Workstream B. `TECHNICAL_ARCHITECTURE.md` §8, §18, R8.
 *
 * DEPENDENCY-FREE BY DESIGN. This speaks Sanity's documented HTTP query API directly with
 * `fetch` rather than through `@sanity/client`, for two reasons:
 *
 *   1. §23.3 makes `package.json` Workstream A's single-owner file. Adding a vendor SDK to the
 *      web application's dependency tree is a change to A's build, not B's — it would need an
 *      integration handoff. The HTTP API needs nothing installed.
 *   2. §8 states the query-layer boundary "is the hedge that makes the Payload fallback real"
 *      (R8). A ~90-line transport is a smaller thing to replace than an SDK woven through the
 *      build.
 *
 * The endpoint shape, parameter names, auth header, response envelope and the 11 KB GET
 * ceiling were verified against Sanity's HTTP API reference on 2026-08-11. If a future
 * requirement genuinely needs the SDK (listeners, mutations, image-URL builder), that is an
 * explicit handoff to A — this module is the single seam to swap.
 */

import {
  MAX_GET_QUERY_BYTES,
  assertProductionPerspective,
  queryUrlBase,
  type SanityConfig,
} from './config.js';

export class ContentFetchError extends Error {
  override readonly name = 'ContentFetchError';
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

/** GROQ parameter values we are willing to serialize. Keeps injection surface at zero. */
export type QueryParams = Readonly<Record<string, string | number | boolean>>;

export interface ContentClient {
  fetch<T>(query: string, params?: QueryParams): Promise<T>;
}

/** Sanity's response envelope (verified 2026-08-11). */
interface QueryEnvelope<T> {
  readonly result: T;
  readonly ms?: number;
  readonly query?: string;
}

/**
 * §18: the read token lives in the build environment and must never reach a client bundle.
 * Production is 100% statically prerendered (§6.1), so this module only ever runs in Node.
 * A browser-side execution means something has gone structurally wrong — fail rather than
 * leak a credential into a network request the visitor can observe.
 */
function assertServerSide(): void {
  if (typeof window !== 'undefined') {
    throw new ContentFetchError(
      'The CMS client may not run in a browser. The read token is build-environment-only (TECHNICAL_ARCHITECTURE.md §18).',
    );
  }
}

export function createContentClient(config: SanityConfig): ContentClient {
  assertProductionPerspective(config.perspective);

  return {
    async fetch<T>(query: string, params: QueryParams = {}): Promise<T> {
      assertServerSide();

      const url = new URL(queryUrlBase(config));
      url.searchParams.set('query', query);
      // Explicit on every request. §18's "Consequence to respect": a Viewer token *can* read
      // drafts, so `published` is asserted, never inherited from a vendor default.
      url.searchParams.set('perspective', config.perspective);

      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(`$${key}`, JSON.stringify(value));
      }

      const href = url.toString();
      if (new TextEncoder().encode(href).length > MAX_GET_QUERY_BYTES) {
        throw new ContentFetchError(
          `Query exceeds Sanity's ${MAX_GET_QUERY_BYTES}-byte GET limit. Split the projection rather than truncating it.`,
        );
      }

      const response = await globalThis.fetch(href, {
        headers: {
          // Bearer auth, verified against the HTTP API reference 2026-08-11.
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        // The body may echo the query; it must never echo the token, which is header-only.
        throw new ContentFetchError(
          `Sanity query failed with HTTP ${response.status} ${response.statusText}.`,
          response.status,
        );
      }

      const envelope = (await response.json()) as QueryEnvelope<T>;
      return envelope.result;
    },
  };
}

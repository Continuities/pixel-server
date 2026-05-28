// Type definitions for express-md 2.x
// Project: https://github.com/john-doherty/express-md
// Definitions by: Generated from source

import { RequestHandler } from "express";

/**
 * Creates an Express middleware that serves markdown files from `options.dir`
 * as rendered HTML, with optional per-directory `template.html` support,
 * in-memory caching, and pass-through for static assets.
 *
 * @param options - Configuration for the middleware instance.
 * @returns An Express `RequestHandler` suitable for use with `app.use()`.
 *
 * @example
 * ```ts
 * import expressMd = require('express-md');
 * // or, with esModuleInterop enabled:
 * import expressMd from 'express-md';
 *
 * const app = express();
 *
 * app.use(expressMd({
 *   dir: __dirname + '/docs',
 *   url: '/',
 *   vars: { title: 'My Docs' },
 * }));
 *
 * app.listen(3000);
 * ```
 */
declare function expressMd(options?: expressMd.Options): RequestHandler;

/**
 * Namespace merged with the function to expose public types.
 * Access them as `expressMd.Options`, `expressMd.Cache`, etc.
 */
declare namespace expressMd {
  /**
   * Interface for a custom cache implementation.
   * Must be supplied as a constructor (class). `express-md` will call
   * `new cache()` and then invoke `flushAll()` to start with an empty cache.
   */
  interface Cache {
    /** Flush / clear all cached entries. */
    flushAll(): void;
    /** Retrieve a cached value by key. */
    get(key: string): unknown;
    /** Store a value under key. */
    set(key: string, value: unknown): void;
  }

  /** Constructor signature for a custom cache implementation. */
  interface CacheConstructor {
    new (): Cache;
  }

  /** Configuration options for `expressMd()`. */
  interface Options {
    /**
     * Absolute (or relative) path to the directory that contains the
     * markdown files to serve.
     * @default 'docs'
     */
    dir?: string;

    /**
     * The URL base from which the markdown files should be served.
     * A trailing slash is appended automatically if absent.
     * @default '/docs/'
     */
    url?: string;

    /**
     * File extensions that are treated as markdown and converted to HTML.
     * @default ['.md', '.mdown']
     */
    extensions?: string[];

    /**
     * File extensions that are served as-is (pass-through) without any
     * markdown rendering.
     * @default ['.css', '.png', '.jpg', '.jpeg', '.js']
     */
    passthrough?: string[];

    /**
     * Additional HTTP response headers to include in every response.
     * @example { 'Cache-Control': 'public,max-age=3600' }
     */
    headers?: Record<string, string>;

    /**
     * Controls the caching subsystem:
     * - Omit (or `undefined`) to use the built-in in-memory cache.
     * - `false` to disable caching entirely.
     * - A constructor implementing `CacheConstructor` for a custom adapter.
     */
    cache?: false | CacheConstructor;

    /**
     * When `true`, the cache is invalidated whenever a file change is
     * detected inside `dir`. Disabled by default because it can exhaust
     * file handles on large directory trees.
     * @default false
     */
    watch?: boolean;

    /**
     * Request paths to skip entirely, passing the request to the next
     * middleware. Each entry may be a string suffix or a `RegExp` tested
     * against the full pathname.
     * @default []
     */
    ignore?: Array<string | RegExp>;

    /**
     * Variables made available inside markdown files and HTML templates via
     * the `{{{ variableName }}}` placeholder syntax. Query-string parameters
     * from the incoming request are merged in on top at request time.
     * @default {}
     */
    vars?: Record<string, unknown>;
  }
}

export = expressMd;

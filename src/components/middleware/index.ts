/**
 * Koa caching middleware
 * koa-cache
 * Created by Thomas Sham on 11/12/2023.
 */

import { Middleware } from "koa";

import { Cacher, } from "../cacher/index.js";

interface MiddlewareOptions {
    cache2XXOnly: boolean;
    ignoreEmptyBody: boolean;
}

const defaults: MiddlewareOptions = {
    cache2XXOnly: true,
    ignoreEmptyBody: true,
};

export function cacherFactory (store: Cacher, opts: MiddlewareOptions = defaults): Middleware {
    return async function cacher (
        ctx,
        next
    ) {
        const key = `${ ctx.request.path }${ ctx.request.search }`;
        if (await store.has(key)) {
            ctx.response.body = await store.get(key);
            return;
        }
        await next();

        if (opts.cache2XXOnly && (ctx.response.status < 200 || ctx.response.status > 300)) {
            return;
        }

        if (opts.ignoreEmptyBody && !ctx.response.body) {
            return;
        }

        if (typeof ctx.response.body === "string") {
            await store.set(key, ctx.response.body);
        }
    }
}

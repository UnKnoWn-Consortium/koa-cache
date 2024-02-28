/**
 * Koa caching middleware
 * koa-cache
 * Created by Thomas Sham on 11/12/2023.
 */

import { Middleware, Request } from "koa";

import { Cachier, } from "../cachier/index.js";

interface MiddlewareOptions {
    cache2XXOnly?: boolean;
    ignoreEmptyBody?: boolean;
    keyCustomizer?: Function;
}

const defaults: MiddlewareOptions = {
    cache2XXOnly: true,
    ignoreEmptyBody: true,
};

export function keyBuilder(request: Request, ...args: string[]): string {
    let key = `${ request.path }${ request.search }`;
    for (const arg of args) {
        if (arg) {
            key += `:${ arg }`;
        }
    }
    return key;
}

export function cachierFactory(
    store: Cachier,
    opts: MiddlewareOptions = defaults,
    postCacheMiddleware?: Function
): Middleware {
    opts = { ...defaults, ...opts };
    return async function cacher(
        ctx,
        next
    ) {
        let key: any;
        if (opts.keyCustomizer && typeof opts.keyCustomizer === "function") {
            key = opts.keyCustomizer(ctx);
            if (!key || typeof key !== "string") {
                throw new Error("key from `keyCustomizer` function is falsy or not a string");
            }
        } else {
            key = keyBuilder(ctx.request);
        }

        if (await store.has(key)) {
            ctx.response.status = 200;
            ctx.response.body = JSON.parse(await store.get(key) ?? "");
            if (postCacheMiddleware && typeof postCacheMiddleware === "function") {
                await postCacheMiddleware(ctx, next);
            }
            return;
        }

        await next();

        if (opts.cache2XXOnly && (ctx.response.status < 200 || ctx.response.status > 300)) {
            return;
        }
        if (opts.ignoreEmptyBody && !ctx.response.body) {
            return;
        }
        await store.set(key, JSON.stringify(ctx.response.body));
    }
}

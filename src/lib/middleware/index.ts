/**
 * Koa caching middleware
 * koa-cache
 * Created by Thomas Sham on 11/12/2023.
 */

import { Middleware, Request } from "koa";

import { Cacher, } from "../cachier/index.js";

interface MiddlewareOptions {
    cache2XXOnly?: boolean;
    ignoreEmptyBody?: boolean;
    customKeyPart?: string;
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

export function cachierFactory(store: Cacher, opts: MiddlewareOptions = defaults, ): Middleware {
    opts = { ...defaults, ...opts };
    return async function cacher (
        ctx,
        next
    ) {
        let key: string;
        if (opts.customKeyPart) {
            let part: any = ctx;
            for (let i = 0; i < opts.customKeyPart.split(".").length; i++) {
                part = part[opts.customKeyPart.split(".")[i]];
            }
            key = keyBuilder(ctx.request, part);
        } else {
            key = keyBuilder(ctx.request);
        }

        if (await store.has(key)) {
            ctx.response.status = 200;
            ctx.response.body = JSON.parse(await store.get(key) ?? "");
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

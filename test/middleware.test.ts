import { describe, it, before, after, afterEach, } from "node:test"
import { strictEqual, } from "node:assert";

import { ParameterizedContext, Request, } from "koa";

import { Store, cachier, keyBuilder } from "../src/index.js";

let store: Store;

const ctxOriginal: any = {
    state: {
        user: {
            _id: "testing1234"
        }
    },
    request: {
        path: "/v1.0/test/cache",
        search: "?test1=1&test2=2",
    },
    response: {

    },
};

describe(
    "Middleware tests",
    async () => {
        before(() => store = new Store({ expire: 5 }));

        it("key builder creates key from requests correctly", async () => {
            const ctx: any = Object.assign({}, ctxOriginal);
            strictEqual(
                keyBuilder(<Request>ctx.request),
                "/v1.0/test/cache?test1=1&test2=2"
            );
            strictEqual(
                keyBuilder(<Request>ctx.request, "test1"),
                "/v1.0/test/cache?test1=1&test2=2:test1"
            );
            strictEqual(
                keyBuilder(<Request>ctx.request, "test1", "test2"),
                "/v1.0/test/cache?test1=1&test2=2:test1:test2"
            );
        });

        it("middleware caches response body", async () => {
            const ctx: any = Object.assign({}, ctxOriginal);
            const middleware = cachier(store);
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), null);
            await middleware(
                <ParameterizedContext>ctx,
                async () => {
                    ctx.response.status = 200;
                    ctx.response.body = "test-cache-1234";
                }
            );
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), '"test-cache-1234"');
        });

        it("middleware does not invoke the next handler if cached body exists", async (t) => {
            const ctx: any = Object.assign({}, ctxOriginal);
            const next = t.mock.fn(async () => {
                ctx.response.status = 200;
                ctx.response.body = "test-cache-5678";
            });
            const middleware = cachier(store);
            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
        });

        it("middleware does not cache empty response body", async () => {
            const ctx: any = Object.assign({}, ctxOriginal);
            const middleware = cachier(store, { ignoreEmptyBody: true, });
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), null);
            await middleware(
                <ParameterizedContext>ctx,
                async () => {
                    ctx.response.status = 200;
                    ctx.response.body = "";
                }
            );
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), null);
        });

        it("middleware does not cache non-successful (~2XX) response body", async () => {
            const ctx: any = Object.assign({}, ctxOriginal);
            const middleware = cachier(store, { cache2XXOnly: true, });
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), null);
            await middleware(
                <ParameterizedContext>ctx,
                async () => {
                    ctx.response.status = 400;
                    ctx.response.body = "test-cache-1234";
                }
            );
            strictEqual(await store.get(keyBuilder(<Request>ctx.request)), null);
        });

        it("`keyCustomizer` option accepts a key-customizing function", async () => {
            const ctx: any = Object.assign({}, ctxOriginal);
            let key: string = "";
            const middleware = cachier(
                store,
                { keyCustomizer: (ctx: ParameterizedContext) => {
                        key = `cachier-is-great-${ ctx?.state?.user?._id }`;
                        return key;
                    }
                }
            );
            await middleware(
                <ParameterizedContext>ctx,
                async () => {
                    ctx.response.status = 200;
                    ctx.response.body = "cachier-is-great-1234";
                }
            );
            strictEqual(await store.get(key), '"cachier-is-great-1234"');
            await store.delete(key);
        });

        it("`postCacheMiddleware` get called if cached body exists", async (t) => {
            const postCacheMiddleware = t.mock.fn(async (ctx, next) => {
                ctx.response.status = 204;
                ctx.response.body = "";
            });
            const middleware = cachier(store, {}, postCacheMiddleware);

            const ctx: any = Object.assign({}, ctxOriginal);
            const next = t.mock.fn(async () => {
                ctx.response.status = 200;
                ctx.response.body = "test-cache-5678";
            });

            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
            strictEqual(postCacheMiddleware.mock.calls.length, 0);
            strictEqual(ctx.response.status, 200);
            strictEqual(ctx.response.body, "test-cache-5678");

            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
            strictEqual(postCacheMiddleware.mock.calls.length, 1);
            strictEqual(ctx.response.status, 204);
            strictEqual(ctx.response.body, "");
        });

        afterEach(async () => await store.delete(keyBuilder(<Request>ctxOriginal.request)));

        after(() => store.destroy());
    }
);

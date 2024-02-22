import { describe, it, before, after, afterEach, } from "node:test"
import { strictEqual, } from "node:assert";

import { ParameterizedContext, Request, } from "koa";

import { Store, cacher, keyBuilder } from "../src/index.js";

let store: Store;

const ctx: any = {
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
            const middleware = cacher(store);
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
            const next = t.mock.fn(async () => {
                ctx.response.status = 200;
                ctx.response.body = "test-cache-5678";
            });
            const middleware = cacher(store);
            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
            await middleware(<ParameterizedContext>ctx, next);
            strictEqual(next.mock.calls.length, 1);
        });

        it("middleware does not cache empty response body", async () => {
            const middleware = cacher(store, { ignoreEmptyBody: true, });
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
            const middleware = cacher(store, { cache2XXOnly: true, });
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

        afterEach(async () => await store.delete(keyBuilder(<Request>ctx.request)));

        after(() => store.destroy());
    }
);

import { describe, it, before, after, } from "node:test";
import { strictEqual, deepStrictEqual, } from "node:assert";
import { setTimeout, } from "node:timers/promises";

import { Store, } from "../src/index.js";

let store: Store;

const testKey1 = "test1";
const testKey2 = "test2";
const testKey3 = "test3";
const testValue1 = "1234";
const testValue2 = "5678";
const testValue3 = "8765";

describe(
    "Cacher tests",
    async () => {
        before(() => store = new Store({ expire: 2 }));

        it("a key should be set to a value", async () => {
            await store.set(testKey1, testValue1);
            strictEqual(await store.get(testKey1), testValue1);
        });

        it("a key should be updated/reset to another value", async () => {
            await store.set(testKey1, testValue2);
            strictEqual(await store.get(testKey1), testValue2);
        });

        it("a key should be deleted", async () => {
            await store.delete(testKey1);
            strictEqual(await store.get(testKey1), null);
        });

        it("all keys set should be listed", async () => {
            await store.set(testKey1, testValue1);
            await store.set(testKey2, testValue2);
            await store.set(testKey3, testValue3);
            deepStrictEqual(await store.list(), new Set([testKey1, testKey2, testKey3]));
        });

        it("a key should expire", async () => {
            await store.set(testKey1, testValue1);
            await setTimeout(2 * 1000 + 10, "");
            strictEqual(await store.get(testKey1), null);
        });

        after(async () => {
            await store.delete(testKey1);
            await store.delete(testKey2);
            await store.delete(testKey3);
            store.destroy();
        });
    }
);

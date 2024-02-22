import { describe, it } from "node:test";
import assert from "node:assert";
import { Cacher, } from "../src/index.js";
describe("Cacher test: ", async () => {
    it("some test", async (t) => {
        const store = new Cacher();
        assert.strictEqual(9, 9);
    });
});
//# sourceMappingURL=cacher.test.js.map
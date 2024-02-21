var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _Cacher_instance;
import { Redis } from "ioredis";
const defaults = {
    port: 6379,
    host: "127.0.0.1",
    keyPrefix: "",
    expire: 24 * 60 * 60,
};
export class Cacher {
    constructor(opts = defaults) {
        if (__classPrivateFieldGet(_a, _a, "f", _Cacher_instance)) {
            return __classPrivateFieldGet(_a, _a, "f", _Cacher_instance);
        }
        __classPrivateFieldSet(_a, _a, this, "f", _Cacher_instance);
        this.connection = new Redis(opts);
    }
    async has(key) {
        return await this.connection.exists(key) === 1;
    }
    async set(key, value) {
        return await this.connection.set(key, value, "EX", 1000) === "OK";
    }
    get(key) {
        return this.connection.get(key);
    }
}
_a = Cacher;
_Cacher_instance = { value: void 0 };
//# sourceMappingURL=index.js.map
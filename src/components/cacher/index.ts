import { Redis, RedisOptions } from "ioredis";

export interface CacherOptions extends RedisOptions {
    expire?: number;
}

const defaults: CacherOptions = {
    port: 6379,
    host: "127.0.0.1",
    keyPrefix: "koa-cacher:",
    expire: 24 * 60 * 60,
};

export class Cacher {
    static #instance: Cacher | undefined;

    options: CacherOptions;
    // @ts-ignore
    #connection: Redis;

    constructor(opts: CacherOptions = defaults) {
        this.options = { ...defaults, ...opts };
        if (Cacher.#instance) {
            return Cacher.#instance;
        }
        Cacher.#instance = this;
        this.#connection = new Redis(this.options);
    }

    async list() {
        const keys = await this.#connection.keys(`${ this.options.keyPrefix }*`);
        return this.options.keyPrefix ?
            new Set(keys.map(val => val.replace(<string>this.options.keyPrefix, ""))) :
            new Set(keys);
    }

    async has(key: string) {
        return await this.#connection.exists(key) === 1;
    }

    get(key: string) {
        return this.#connection.get(key);
    }

    async set(key: string, value: string) {
        return this.options.expire ?
            await this.#connection.set(key, value, "EX", this.options.expire) === "OK" :
            await this.#connection.set(key, value) === "OK";
    }

    async delete(key: string, isPattern = false) {
        if (!isPattern) {
            return await this.#connection.del(key) === 1;
        }
        const keys = await this.#connection.keys(`${ this.options.keyPrefix }${ key }*`);
        await Promise.allSettled(
            keys
                .map(val => val.replace(<string>this.options.keyPrefix, ""))
                .map(key => this.#connection.del(key))
        );
        return true;
    }

    destroy() {
        this.#connection.disconnect();
        Cacher.#instance = undefined;
    }
}

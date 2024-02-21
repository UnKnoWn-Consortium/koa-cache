import { Redis, RedisOptions } from "ioredis";

export interface CacherOptions extends RedisOptions {
    expire: number;
}

const defaults: CacherOptions = {
    port: 6379,
    host: "127.0.0.1",
    keyPrefix: "",
    expire: 24 * 60 * 60,
}

export class Cacher {
    static #instance: Cacher;

    // @ts-ignore
    connection: Redis;

    constructor(opts: CacherOptions = defaults) {
        if (Cacher.#instance) {
            return Cacher.#instance;
        }

        Cacher.#instance = this;
        this.connection = new Redis(opts);
    }

    async has (key: string) {
        return await this.connection.exists(key) === 1;
    }

    async set (key: string, value: string) {
        return await this.connection.set(key, value, "EX", 1000) === "OK";
    }

    get (key: string) {
        return this.connection.get(key);
    }

}

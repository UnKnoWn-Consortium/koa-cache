import { Redis, RedisOptions } from "ioredis";
export interface CacherOptions extends RedisOptions {
    expire: number;
}
export declare class Cacher {
    #private;
    connection: Redis;
    constructor(opts?: CacherOptions);
    has(key: string): Promise<boolean>;
    set(key: string, value: string): Promise<boolean>;
    get(key: string): Promise<string | null>;
}

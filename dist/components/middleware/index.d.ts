/**
 * Koa caching middleware
 * koa-cache
 * Created by Thomas Sham on 11/12/2023.
 */
import { Middleware } from "koa";
import { Cacher } from "../cacher/index.js";
interface MiddlewareOptions {
    cache2XXOnly: boolean;
    ignoreEmptyBody: boolean;
}
export declare function cacherFactory(store: Cacher, opts?: MiddlewareOptions): Middleware;
export {};

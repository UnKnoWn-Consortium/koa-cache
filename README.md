# KOA-CACHIER💲💲

A Koa Middleware backed by a Redis-powered cache store

## Install

```shell
npm i koa-cachier
```

## Usage

```typescript
import Koa from "koa";
const app = new Koa();

import { Store, cachier } from "koa-cachier";

const store = new Store(); 
app.use(cachier(store));
```

## API

```typescript
cachier(store, options?);
```

The middleware factory accepts an `options` object. It is expected to contain the following properties: 

#### cache2XXOnly?

Type: `string`\
Default: `true`\
Optional: **Yes**

When set to `true`, only successful response bodies are cached.\
When set to `false`, all response bodies are cached regardless of response codes.

#### ignoreEmptyBody?

Type: `string`\
Default: `true`\
Optional: **Yes**

When set to `true`, empty response bodies are not cached.\
When set to `false`, empty response bodies are also cached. 

#### keyCustomizer(ctx)?

Type: `Function`\
Default: `undefined`\
Optional: **Yes**

By default, cache store keys are generated with the `keyBuilder` as defined in https://github.com/UnKnoWn-Consortium/koa-cachier/blob/b3bd39bf622fbecd71daf717d5d73e53ff25b0a3/src/lib/middleware/index.ts#L22-L30

`keyBuilder` is a named export in `koa-cachier`.

You can change that by passing in your own key generator via `keyCustomizer`.\
Koa `ctx` is passed to this function when called.

```typescript
cachier(store, options?, postCacheMiddleware?);
```

#### postCacheMiddleware(ctx, next)?
Type: `Function`\
Default: `undefined`\
Optional: **Yes**

The middleware factory also accepts a `postCacheMiddleware` function as the last parameter. 

If defined, it gets called with Koa `ctx` and `next` whenever a cached body is found in the store. 

Combined with `koa-compose`, `postCacheMiddleware` can be leveraged to create an alternative post-cache middleware chain. 



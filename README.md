# KOA-CACHIER

A Koa Middleware backed by a Redis-powered cache store

## Usage

```shell
npm i koa-cachier
```

```typescript
import { Store, cachier } from "koa-cachier";

const store = new Store(); 
app.use(cachier(store));
```



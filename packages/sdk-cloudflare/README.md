## Target CDN Experimentation - Cloudflare Workers SDK

Runs the shared decisioning core (`packages/sdk`) inside a Cloudflare Worker. It has the same API as the NodeJS and Akamai SDKs.

### What is different on Workers

| Concern | Handling |
|---|---|
| No long-lived timers | Rules are refreshed lazily: when a request arrives after `rulesPoolingInterval` elapsed, the refresh runs in the background through `waitUntil` |
| Background work | Pass `ctx.waitUntil` per call: `client.sendEvent(event, { waitUntil: (p) => ctx.waitUntil(p) })`. It keeps display notifications and rule refreshes alive after the response is returned |
| Crypto | Web Crypto `getRandomValues` and a pure JS md5, no `nodejs_compat` flag needed |
| HTTP | `fetch` |

### Usage

```javascript
import { Client } from "@adobe/target-cdn-experimentation-cloudflare-sdk";

let client; // create once per isolate
export default {
  async fetch(request, env, ctx) {
    client ??= await Client({
      datastreamId: env.DATASTREAM_ID,
      orgId: env.ORG_ID,
      propertyToken: env.PROPERTY_TOKEN,
      oddEnabled: true,
      rulesPoolingInterval: 300,
    });
    const response = await client.sendEvent(event, {
      waitUntil: (promise) => ctx.waitUntil(promise),
    });
    // ...
  },
};
```

The options are the same as in the [NodeJS SDK](../sdk-nodejs/README.md) (without `platform`).

### Demo Worker

`demo/worker.js` returns the decisions as JSON and sets the `state:store` cookies (including the `kndctr_*` identity cookie) on the response. Configure the variables in `demo/wrangler.toml`, then:

```bash
npm run dev      # wrangler dev, local workerd runtime (needs Node.js 22+)
npm run deploy   # wrangler deploy, needs `wrangler login` and a Cloudflare account
```

`*.workers.dev` is enough for testing; a zone is only needed to route real hostnames to the Worker.

### Testing before deploying

Run the same code on Node with the platform flag of the NodeJS SDK:

```javascript
import { Client } from "@adobe/target-cdn-experimentation-nodejs-sdk";
const client = await Client({ ...options, platform: "cloudflare" });
```

### Limitations

- Same as the other CDN SDKs: form-based Experience Composer offers and the supported audience rules only. See `design.md`.
- Rules freshness equals `rulesPoolingInterval`; a feature flag change is only picked up after it elapses.

/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { Client } from "../src/index.js"; // in a customer project: "@adobe/target-cdn-experimentation-cloudflare-sdk"
import { buildSetCookies, createClientEvent, getDecisions } from "./utils.js";

const buildConfig = (env) => ({
  datastreamId: env.DATASTREAM_ID,
  orgId: env.ORG_ID,
  propertyToken: env.PROPERTY_TOKEN,
  oddEnabled: env.ODD_ENABLED === "true",
  edgeDomain: env.EDGE_DOMAIN || undefined,
  rulesPoolingInterval: Number(env.RULES_POOLING_INTERVAL_SECONDS) || undefined,
  decisionScopes: (env.DECISION_SCOPES || "__view__").split(","),
});

// The client is created once per isolate and reused by every request it serves.
let clientPromise = null;
const getClient = (config) => {
  clientPromise = clientPromise || Client(config);
  clientPromise.catch(() => {
    clientPromise = null; // retry on the next request if initialization failed
  });
  return clientPromise;
};

export default {
  async fetch(request, env, ctx) {
    try {
      const config = buildConfig(env);
      const client = await getClient(config);
      const sdkResponse = await client.sendEvent(
        createClientEvent(request, config),
        { waitUntil: (promise) => ctx.waitUntil(promise) },
      );

      const decisions = getDecisions(sdkResponse);
      const headers = new Headers({
        "Content-Type": "application/json",
        "X-Target-Platform": "cloudflare-workers",
        "X-Target-Mode": config.oddEnabled ? "odd" : "network",
        "X-Target-Decisions": String(decisions.length),
      });
      for (const cookie of buildSetCookies(sdkResponse, env.COOKIE_DOMAIN)) {
        headers.append("Set-Cookie", cookie);
      }
      return new Response(JSON.stringify({ decisions }, null, 2), { headers });
    } catch (error) {
      return new Response(`${request.method}: ${error.message}`, {
        status: 500,
      });
    }
  },
};

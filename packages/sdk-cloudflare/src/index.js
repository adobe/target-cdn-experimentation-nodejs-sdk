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

import {
  BaseClient,
  Container,
  TOKENS,
} from "@adobe/target-cdn-experimentation-core";
import { createCloudflareAdapters } from "./adapters.js";

/**
 * The Client initialization method.
 * Create it once per isolate and reuse it across requests. Pass `ctx.waitUntil` to
 * `sendEvent` / `sendNotification` so rule refreshes and notifications finish after the response.
 * @param {import("../types").ClientOptions} clientOptions
 * @returns {Promise<import("../types").ClientResponse>}
 */
export async function Client(clientOptions) {
  const adapters = createCloudflareAdapters();
  Container().registerInstance(TOKENS.RNG, adapters.rng);
  Container().registerInstance(TOKENS.HTTP_CLIENT, adapters.httpClient);
  Container().registerInstance(TOKENS.LOGGER, adapters.logger);
  Container().registerInstance(TOKENS.MD5, adapters.md5);
  Container().registerInstance(TOKENS.SCHEDULER, adapters.scheduler);
  return BaseClient(clientOptions);
}

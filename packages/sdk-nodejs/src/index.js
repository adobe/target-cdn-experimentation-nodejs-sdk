/*
Copyright 2024 Adobe. All rights reserved.
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
import { getPlatformAdapters, PLATFORMS } from "./platforms/index.js";

let activePlatform = null;

/**
 * The Client initialization method
 * `platform` selects which runtime to emulate: "node" (default), "akamai" or "cloudflare".
 * It can also be set with the TARGET_SDK_PLATFORM environment variable.
 * @param {import("../types").ClientOptions} clientOptions - The configuration options for the client
 * @returns {Promise<import("../types").ClientResponse>} A promise that resolves to the client response object
 */
export async function Client(clientOptions) {
  const platform =
    clientOptions?.platform ??
    globalThis.process?.env?.TARGET_SDK_PLATFORM ??
    PLATFORMS.NODE;
  const adapters = getPlatformAdapters(platform);

  // the container keeps the first registration, so a different platform needs a clean slate
  if (activePlatform && activePlatform !== platform) {
    Container().reset();
  }
  activePlatform = platform;

  Container().registerInstance(TOKENS.RNG, adapters.rng);
  Container().registerInstance(TOKENS.HTTP_CLIENT, adapters.httpClient);
  Container().registerInstance(TOKENS.LOGGER, adapters.logger);
  Container().registerInstance(TOKENS.MD5, adapters.md5);
  Container().registerInstance(TOKENS.SCHEDULER, adapters.scheduler);
  return BaseClient(clientOptions);
}

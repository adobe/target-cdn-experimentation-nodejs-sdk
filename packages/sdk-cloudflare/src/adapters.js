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
  createFetchAdapter,
  createLazyScheduler,
  md5,
} from "@adobe/target-cdn-experimentation-core";

// Workers provide Web Crypto; 16 random bytes are enough for one UUID v4
export const rng = () => globalThis.crypto.getRandomValues(new Uint8Array(16));

export const httpRequestAdapterInstance = createFetchAdapter();

/**
 * The platform pieces the shared core needs, as a Cloudflare Worker provides them.
 * Also used by the Node SDK to run in "cloudflare" mode locally.
 */
export const createCloudflareAdapters = () => ({
  rng,
  httpClient: httpRequestAdapterInstance,
  logger: console,
  md5,
  scheduler: createLazyScheduler(),
});

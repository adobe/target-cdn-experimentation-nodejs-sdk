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

// Emulates how the Akamai SDK wires the core: Web Crypto, pure-JS md5 and a request-driven scheduler.
// The Akamai-only modules (http-request, log, crypto) are replaced by their Node equivalents.
export const createAkamaiAdapters = () => ({
  rng: () => globalThis.crypto.getRandomValues(new Uint8Array(256)),
  httpClient: createFetchAdapter(),
  logger: console,
  md5,
  scheduler: createLazyScheduler(),
});

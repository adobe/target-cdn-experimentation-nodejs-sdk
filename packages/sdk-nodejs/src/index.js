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
import { rng } from "./uuid/rng.js";
import { httpRequestAdapterInstance } from "./httpRequestAdapter.js";
import { md5 } from "./md5.js";
import { createNodeScheduler } from "./scheduler.js";

/**
 * The Client initialization method
 * @param {import("../types").ClientOptions} clientOptions - The configuration options for the client
 * @returns {Promise<import("../types").ClientResponse>} A promise that resolves to the client response object
 */
export async function Client(clientOptions) {
  Container().registerInstance(TOKENS.RNG, rng);
  Container().registerInstance(TOKENS.HTTP_CLIENT, httpRequestAdapterInstance);
  Container().registerInstance(TOKENS.LOGGER, console);
  Container().registerInstance(TOKENS.MD5, md5);
  Container().registerInstance(TOKENS.SCHEDULER, createNodeScheduler());
  return BaseClient(clientOptions);
}

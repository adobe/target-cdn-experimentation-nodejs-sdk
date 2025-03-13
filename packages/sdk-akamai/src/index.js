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

import { logger } from "log";
import { BaseClient } from "../../sdk/src/index.js";
import { Container, TOKENS } from "sdk/src/container.js";
import { rng } from "./uuid/rng.js";
import { httpRequestAdapterInstance } from "./httpRequestAdapter.js";

export async function Client(clientOptions) {
  Container().registerInstance(TOKENS.RNG, rng);
  Container().registerInstance(TOKENS.HTTP_CLIENT, httpRequestAdapterInstance);
  Container().registerInstance(TOKENS.LOGGER, logger);
  return BaseClient(clientOptions);
}

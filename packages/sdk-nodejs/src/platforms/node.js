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

import { rng } from "../uuid/rng.js";
import { httpRequestAdapterInstance } from "../httpRequestAdapter.js";
import { md5 } from "../md5.js";
import { createNodeScheduler } from "../scheduler.js";

// Default: real Node.js behaviour (crypto module, setInterval)
export const createNodeAdapters = () => ({
  rng,
  httpClient: httpRequestAdapterInstance,
  logger: console,
  md5,
  scheduler: createNodeScheduler(),
});

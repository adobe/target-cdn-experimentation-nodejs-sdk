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

import { createNodeAdapters } from "./node.js";
import { createAkamaiAdapters } from "./akamai.js";
import { createCloudflareAdapters } from "./cloudflare.js";

export const PLATFORMS = {
  NODE: "node",
  AKAMAI: "akamai",
  CLOUDFLARE: "cloudflare",
};

const FACTORIES = {
  [PLATFORMS.NODE]: createNodeAdapters,
  [PLATFORMS.AKAMAI]: createAkamaiAdapters,
  [PLATFORMS.CLOUDFLARE]: createCloudflareAdapters,
};

export const getPlatformAdapters = (platform) => {
  const factory = FACTORIES[platform];
  if (!factory) {
    throw new Error(
      `Unknown platform "${platform}". Use one of: ${Object.values(PLATFORMS).join(", ")}`,
    );
  }
  return factory();
};

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
import { describe, it, expect, beforeAll } from "@jest/globals";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { webcrypto } from "node:crypto";
import { createCloudflareAdapters, rng } from "../src/adapters.js";

describe("cloudflare adapters", () => {
  beforeAll(() => {
    globalThis.crypto ??= webcrypto; // jest's sandbox has no Web Crypto, Workers do
  });

  it("should provide every adapter the core needs", () => {
    const adapters = createCloudflareAdapters();
    expect(Object.keys(adapters).sort()).toEqual(
      ["httpClient", "logger", "md5", "rng", "scheduler"].sort(),
    );
    expect(typeof adapters.httpClient.makeRequest).toBe("function");
    expect(typeof adapters.scheduler.maybeRefresh).toBe("function");
  });

  it("should create a new scheduler for each call", () => {
    expect(createCloudflareAdapters().scheduler).not.toBe(
      createCloudflareAdapters().scheduler,
    );
  });

  it("should generate 16 random bytes", () => {
    const first = rng();
    expect(first).toBeInstanceOf(Uint8Array);
    expect(first).toHaveLength(16);
    expect(Array.from(first)).not.toEqual(Array.from(rng()));
  });

  it("should not import Node.js built-ins in the code that runs on Workers", () => {
    const files = [
      ...readdirSync("src").map((f) => join("src", f)),
      ...readdirSync("demo")
        .filter((f) => f.endsWith(".js"))
        .map((f) => join("demo", f)),
      ...readdirSync("../sdk/src/edge").map((f) => join("../sdk/src/edge", f)),
    ];
    const nodeImport =
      /(from\s+|import\s*\(|require\()\s*["'](node:|crypto|fs|http|https|path|os|stream|buffer|zlib)["'/]/;
    for (const file of files) {
      expect({
        file,
        bad: nodeImport.test(readFileSync(file, "utf8")),
      }).toEqual({ file, bad: false });
    }
  });
});

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
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { webcrypto } from "node:crypto";
import { Container, TOKENS } from "@adobe/target-cdn-experimentation-core";
import { rules } from "../../sdk-akamai/demo/rules.js";
import { Client } from "../src/index.js";
import { getPlatformAdapters, PLATFORMS } from "../src/platforms/index.js";

const jsonResponse = (body) => ({
  status: 200,
  ok: true,
  statusText: "",
  text: async () => JSON.stringify(body),
});

const edgeReply = {
  handle: [
    {
      type: "personalization:decisions",
      payload: [{ id: "p1", scope: "__view__", items: [] }],
    },
  ],
};

const options = {
  datastreamId: "ds-1",
  orgId: "ADB3LETTERSANDNUMBERS@AdobeOrg",
  propertyToken: "prop",
  oddEnabled: false,
};

describe("platform flag", () => {
  let originalFetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn(async (url) =>
      String(url).endsWith("rules.json")
        ? jsonResponse(rules)
        : jsonResponse(edgeReply),
    );
    delete process.env.TARGET_SDK_PLATFORM;
    globalThis.crypto ??= webcrypto; // the jest sandbox has no Web Crypto, Workers and EdgeWorkers do
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TARGET_SDK_PLATFORM;
  });

  it("should expose the supported platforms", () => {
    expect(Object.values(PLATFORMS).sort()).toEqual([
      "akamai",
      "cloudflare",
      "node",
    ]);
  });

  it("should reject an unknown platform", async () => {
    expect(() => getPlatformAdapters("deno")).toThrow(/platform/i);
    await expect(Client({ ...options, platform: "deno" })).rejects.toThrow(
      /platform/i,
    );
  });

  it.each(["akamai", "cloudflare"])(
    "should return decisions on the %s platform",
    async (platform) => {
      const client = await Client({
        ...options,
        platform,
        decisionScopes: ["__view__"],
      });
      const response = await client.sendEvent({ xdm: {} });
      expect(response).toBeDefined();
    },
  );

  const refreshesWhenDue = async (scheduler) => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const handle = scheduler.start(fn, 1000);
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 5000);
    scheduler.maybeRefresh();
    await Promise.resolve();
    jest.restoreAllMocks();
    scheduler.stop(handle);
    return fn.mock.calls.length > 0;
  };

  it("should use the request-driven scheduler for akamai and cloudflare but not for node", async () => {
    await Client({ ...options, platform: "node" });
    expect(
      await refreshesWhenDue(Container().getInstance(TOKENS.SCHEDULER)),
    ).toBe(false);
    await Client({ ...options, platform: "cloudflare" });
    expect(
      await refreshesWhenDue(Container().getInstance(TOKENS.SCHEDULER)),
    ).toBe(true);
    await Client({ ...options, platform: "akamai" });
    expect(
      await refreshesWhenDue(Container().getInstance(TOKENS.SCHEDULER)),
    ).toBe(true);
  });

  it("should read the platform from TARGET_SDK_PLATFORM", async () => {
    process.env.TARGET_SDK_PLATFORM = "cloudflare";
    await Client(options);
    expect(
      await refreshesWhenDue(Container().getInstance(TOKENS.SCHEDULER)),
    ).toBe(true);
  });

  it("should prefer the platform option over the environment variable", async () => {
    process.env.TARGET_SDK_PLATFORM = "cloudflare";
    await Client({ ...options, platform: "node" });
    expect(
      await refreshesWhenDue(Container().getInstance(TOKENS.SCHEDULER)),
    ).toBe(false);
  });

  it("should run ODD with waitUntil on the cloudflare platform", async () => {
    const client = await Client({
      ...options,
      platform: "cloudflare",
      oddEnabled: true,
      decisionScopes: ["cdn-sdk-mbox-test"],
    });
    const waitUntil = jest.fn();
    const scopes = ["cdn-sdk-mbox-test"];
    const response = await client.sendEvent(
      {
        type: "decisioning.propositionFetch",
        personalization: { sendDisplayEvent: false, decisionScopes: scopes },
        xdm: { web: { webPageDetails: { URL: "https://example.com/" } } },
        query: { personalization: { decisionScopes: scopes } },
        meta: {
          state: { domain: "example.com", cookiesEnabled: true, entries: [] },
        },
      },
      { waitUntil },
    );
    const decisions = response.handle.find(
      (h) => h.type === "personalization:decisions",
    );
    expect(decisions.payload[0].scope).toBe("cdn-sdk-mbox-test");
  });
});

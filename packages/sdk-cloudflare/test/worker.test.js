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
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { webcrypto } from "node:crypto";
import { rules } from "../../sdk-akamai/demo/rules.js";

// Node's global fetch types are not available under this jest environment, so the
// Worker runtime pieces (Response, Headers) are provided by a minimal polyfill.
class FakeHeaders {
  constructor(init = {}) {
    this.entries = [];
    Object.entries(init).forEach(([k, v]) => this.append(k, v));
  }
  append(k, v) {
    this.entries.push([k.toLowerCase(), v]);
  }
  get(k) {
    return this.entries.find(([n]) => n === k.toLowerCase())?.[1] ?? null;
  }
  getAll(k) {
    return this.entries
      .filter(([n]) => n === k.toLowerCase())
      .map(([, v]) => v);
  }
}
class FakeResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.headers =
      init.headers instanceof FakeHeaders
        ? init.headers
        : new FakeHeaders(init.headers);
  }
}

const jsonResponse = (body, status = 200) => ({
  status,
  statusText: "",
  ok: status < 300,
  text: async () => JSON.stringify(body),
});

const env = {
  DATASTREAM_ID: "ds-1",
  ORG_ID: "ADB3LETTERSANDNUMBERS@AdobeOrg",
  PROPERTY_TOKEN: "prop-token",
  ODD_ENABLED: "false",
  COOKIE_DOMAIN: "example.com",
};

const edgeReply = {
  handle: [
    {
      type: "personalization:decisions",
      payload: [{ id: "p1", scope: "__view__", items: [] }],
    },
    {
      type: "state:store",
      payload: [{ key: "kndctr_x_cluster", value: "or2", maxAge: 1000 }],
    },
  ],
};

describe("cloudflare demo worker", () => {
  let originalFetch;
  let calls;

  beforeEach(() => {
    jest.resetModules();
    originalFetch = globalThis.fetch;
    globalThis.Response = FakeResponse;
    globalThis.Headers = FakeHeaders;
    calls = [];
    globalThis.crypto ??= webcrypto;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete globalThis.Response;
    delete globalThis.Headers;
  });

  const request = (url = "https://example.com/page?x=1") => ({
    url,
    method: "GET",
    headers: new FakeHeaders({ cookie: "a=b" }),
    cf: { country: "US", region: "CA" },
  });

  const run = async (workerEnv, reply) => {
    globalThis.fetch = jest.fn(async (url, init) => {
      calls.push({ url: String(url), init });
      return reply(String(url));
    });
    const { default: worker } = await import("../demo/worker.js");
    const waitUntilPromises = [];
    const ctx = { waitUntil: (p) => waitUntilPromises.push(p) };
    const response = await worker.fetch(request(), workerEnv, ctx);
    await Promise.all(waitUntilPromises);
    return { response, waitUntilPromises };
  };

  it("should return decisions and cookies in network mode", async () => {
    const { response } = await run(env, () => jsonResponse(edgeReply));

    expect([response.status, response.body]).toEqual([200, expect.any(String)]);
    expect(response.headers.get("X-Target-Platform")).toBe(
      "cloudflare-workers",
    );
    expect(response.headers.get("X-Target-Mode")).toBe("network");
    expect(response.headers.get("X-Target-Decisions")).toBe("1");
    expect(JSON.parse(response.body).decisions).toHaveLength(1);
    expect(response.headers.getAll("Set-Cookie").join(";")).toContain(
      "kndctr_x_cluster=or2",
    );
    expect(calls.some((c) => c.url.includes("/interact"))).toBe(true);
  });

  it("should return a 500 with the error message when initialization fails", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    const { response } = await run(env, () => jsonResponse({}, 500));
    expect(response.status).toBe(500);
  });

  it("should decide locally and register the notification with waitUntil in ODD mode", async () => {
    const { response, waitUntilPromises } = await run(
      { ...env, ODD_ENABLED: "true", DECISION_SCOPES: "cdn-sdk-mbox-test" },
      (url) =>
        url.endsWith("rules.json")
          ? jsonResponse(rules)
          : jsonResponse(edgeReply),
    );

    expect([response.status, response.body]).toEqual([200, expect.any(String)]);
    expect(response.headers.get("X-Target-Mode")).toBe("odd");
    expect(calls.some((c) => c.url.endsWith("rules.json"))).toBe(true);
    expect(Number(response.headers.get("X-Target-Decisions"))).toBeGreaterThan(
      0,
    );
    expect(waitUntilPromises).toHaveLength(0); // rules are not stale yet
  });

  it("should refresh stale rules in the background through waitUntil", async () => {
    const oddEnv = {
      ...env,
      ODD_ENABLED: "true",
      DECISION_SCOPES: "cdn-sdk-mbox-test",
      RULES_POOLING_INTERVAL_SECONDS: "60",
    };
    globalThis.fetch = jest.fn(async (url) => {
      calls.push({ url: String(url) });
      return String(url).endsWith("rules.json")
        ? jsonResponse(rules)
        : jsonResponse(edgeReply);
    });
    const { default: worker } = await import("../demo/worker.js");
    const pending = [];
    const ctx = { waitUntil: (p) => pending.push(p) };

    await worker.fetch(request(), oddEnv, ctx);
    expect(pending).toHaveLength(0);

    const realNow = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(realNow + 61000);
    const rulesCallsBefore = calls.filter((c) =>
      c.url.endsWith("rules.json"),
    ).length;
    await worker.fetch(request(), oddEnv, ctx);
    await Promise.all(pending);
    jest.restoreAllMocks();

    expect(pending).toHaveLength(1);
    expect(calls.filter((c) => c.url.endsWith("rules.json")).length).toBe(
      rulesCallsBefore + 1,
    );
  });
});

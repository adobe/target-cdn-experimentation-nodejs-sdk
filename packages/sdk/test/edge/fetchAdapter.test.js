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
import { describe, it, expect, jest } from "@jest/globals";
import { createFetchAdapter } from "../../src/edge/fetchAdapter.js";

const response = (body, { status = 200, statusText = "" } = {}) => ({
  status,
  statusText,
  ok: status >= 200 && status < 300,
  text: async () => (body === null ? "" : body),
});

describe("fetch adapter", () => {
  const setup = (fetchImpl) => {
    const logger = { log: jest.fn() };
    return {
      logger,
      adapter: createFetchAdapter({ fetch: fetchImpl, logger }),
    };
  };

  it("should return null for a 204 response", async () => {
    const { adapter } = setup(async () => response(null, { status: 204 }));
    await expect(adapter.makeRequest("https://a.test")).resolves.toBeNull();
  });

  it("should parse a JSON body", async () => {
    const { adapter } = setup(async () => response('{"a":1}', { status: 200 }));
    await expect(adapter.makeRequest("https://a.test")).resolves.toEqual({
      a: 1,
    });
  });

  it("should fall back to text when the body is not JSON", async () => {
    const { adapter } = setup(async () => response("plain", { status: 200 }));
    await expect(adapter.makeRequest("https://a.test")).resolves.toBe("plain");
  });

  it("should throw an error with the response details for a non ok status", async () => {
    const { adapter, logger } = setup(async () =>
      response('{"error":"nope"}', { status: 404, statusText: "Not Found" }),
    );

    await expect(adapter.makeRequest("https://a.test/x")).rejects.toMatchObject(
      {
        status: 404,
        statusText: "Not Found",
        url: "https://a.test/x",
        body: { error: "nope" },
      },
    );
    expect(logger.log).toHaveBeenCalled();
  });

  it("should log and rethrow network errors", async () => {
    const failure = new Error("network down");
    const { adapter, logger } = setup(async () => {
      throw failure;
    });

    await expect(adapter.makeRequest("https://a.test")).rejects.toBe(failure);
    expect(logger.log).toHaveBeenCalled();
  });

  it("should use the global fetch by default", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = jest.fn(async () => response('{"ok":true}'));
    try {
      const adapter = createFetchAdapter({ logger: { log: jest.fn() } });
      await expect(adapter.makeRequest("https://a.test")).resolves.toEqual({
        ok: true,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://a.test",
        undefined,
      );
    } finally {
      globalThis.fetch = original;
    }
  });
});

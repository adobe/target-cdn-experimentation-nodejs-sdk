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
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const makeRequestMock = jest.fn();
const actualContainer = await import("../src/container.js");
jest.unstable_mockModule("../src/container.js", async () => {
  return {
    TOKENS: actualContainer.TOKENS,
    Container: jest.fn().mockImplementation(() => ({
      getInstance: () => {
        return {
          makeRequest: makeRequestMock,
        };
      },
    })),
  };
});

const { ruleRequester } = await import("../src/ruleRequester.js");

describe("ruleRequester", () => {
  const clientOptions = {
    orgId: "test-org-id",
    datastreamId: "test-datastream",
  };
  const expectedOptions = {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "text/plain; charset=UTF-8",
      pragma: "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  };

  beforeEach(() => {
    makeRequestMock.mockClear();
  });
  it("should be called with fallback to default values for Domain and Path", async () => {
    await ruleRequester(clientOptions);
    expect(makeRequestMock).toBeCalledWith(
      "https://assets.adobetarget.com/aep-odd-rules/test-org-id/production/v1/rules.json",
      expectedOptions,
    );
  });

  it("should be called with custom values for Domain", () => {
    const customClientOptions = {
      ...clientOptions,
      ruleDomain: "custom-domain",
    };
    ruleRequester(customClientOptions);
    expect(makeRequestMock).toBeCalledWith(
      "https://custom-domain/aep-odd-rules/test-org-id/production/v1/rules.json",
      expectedOptions,
    );
  });
  it("should be called without domain - we have paths without Domain in Akamai", () => {
    const customClientOptions = {
      ...clientOptions,
      ruleDomain: "",
    };
    ruleRequester(customClientOptions);
    expect(makeRequestMock).toBeCalledWith(
      "/aep-odd-rules/test-org-id/production/v1/rules.json",
      expectedOptions,
    );
  });
  it("should throw error if the request fails", async () => {
    const customClientOptions = {
      ...clientOptions,
      ruleDomain: "",
    };
    makeRequestMock.mockImplementationOnce(() => Promise.reject());
    await expect(async () => {
      await ruleRequester(customClientOptions);
    }).rejects.toThrow();
  });
});

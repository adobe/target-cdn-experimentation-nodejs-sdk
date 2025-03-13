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
import { jest, describe, it, expect } from "@jest/globals";

const makeRequestMock = jest.fn();
const actualContainer = await import("sdk/src/container.js");
jest.unstable_mockModule("sdk/src/container.js", async () => {
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

jest.unstable_mockModule("sdk/src/utils/uuid/index.js", () => ({
  uuid: jest.fn().mockImplementation(() => "mocked-uuid"),
}));

const { edgeRequester } = await import("sdk/src/edgeRequester.js");

describe("edgeRequester", () => {
  const clientOptions = {
    orgId: "test-org-id",
    datastreamId: "test-datastream",
  };
  const endpoint = "test-endpoint";
  const requestBody = {
    prop1: "test-request-body",
  };
  const expectedOptions = {
    method: "POST",
    body: requestBody,
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

  it("should be called with fallback to default values for Domain and Path", () => {
    edgeRequester(clientOptions, endpoint, requestBody);
    expect(makeRequestMock).toBeCalledWith(
      "https://edge.adobedc.net/ee/irl1/v2/test-endpoint?dataStreamId=test-datastream&requestId=mocked-uuid",
      expectedOptions,
    );
  });

  it("should be called with custom values for Domain and Path", () => {
    const customClientOptions = {
      ...clientOptions,
      edgeDomain: "custom-domain",
      edgeBasePath: "custom-path",
    };
    edgeRequester(customClientOptions, endpoint, requestBody);
    expect(makeRequestMock).toBeCalledWith(
      "https://custom-domain/custom-path/irl1/v2/test-endpoint?dataStreamId=test-datastream&requestId=mocked-uuid",
      expectedOptions,
    );
  });
  it("should be called without domain - we have paths without Domain in Akamai", () => {
    const customClientOptions = {
      ...clientOptions,
      edgeDomain: "",
      edgeBasePath: "custom-path",
    };
    edgeRequester(customClientOptions, endpoint, requestBody);
    expect(makeRequestMock).toBeCalledWith(
      "/custom-path/irl1/v2/test-endpoint?dataStreamId=test-datastream&requestId=mocked-uuid",
      expectedOptions,
    );
  });
});

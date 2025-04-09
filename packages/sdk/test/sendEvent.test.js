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

const logMock = jest.fn();
const actualContainer = await import("../src/container.js");
jest.unstable_mockModule("../src/container.js", async () => {
  return {
    TOKENS: actualContainer.TOKENS,
    Container: jest.fn().mockImplementation(() => ({
      getInstance: () => {
        return {
          log: logMock,
        };
      },
    })),
  };
});
jest.unstable_mockModule("../src/utils/generateECID.js", () => ({
  generateECID: jest.fn().mockImplementation(() => "mocked-ecid"),
  generateEcidFromFpid: jest.fn().mockImplementation(() => "mocked-ecid"),
}));
jest.unstable_mockModule("../src/utils/flatten.js", () => ({
  flatten: jest
    .fn()
    .mockImplementation(() => ({ "xdm.identityMap.ECID": "fake-ecid" })),
}));
jest.unstable_mockModule("../src/utils/uuid/index.js", () => ({
  uuid: jest.fn().mockImplementation(() => "mocked-uuid"),
}));
const ruleEngineMock = jest.fn().mockImplementation(() => ({}));
jest.unstable_mockModule("../src/RuleEngine.js", () => ({
  RuleEngine: () => ({ execute: ruleEngineMock }),
}));

const { sendEvent } = await import("../src/sendEvent.js");

describe("sendEvent", () => {
  const rulesEngineExecuteMock = jest.fn();
  const clientOptions = {
    orgId: "test-org-id",
    datastreamId: "test-datastream",
    rulesEngine: {
      execute: rulesEngineExecuteMock,
    },
    rules: {
      rules: [],
    },
  };
  const requestBodyNoEvents = {};
  const requestBodyWithEcid = {
    type: "decisioning.propositionFetch",
    xdm: {
      identityMap: {
        ECID: [
          {
            id: "test-ecid",
            primary: true,
            authenticatedState: "ambiguous",
            xid: "test-xid",
          },
        ],
      },
    },
  };
  const expectedEmptyConsequenceResponse = {
    requestId: "mocked-uuid",
    handle: [
      {
        payload: [
          {
            id: "mocked-ecid",
            namespace: {
              code: "ECID",
            },
          },
        ],
        type: "identity:result",
      },
      {
        eventIndex: 0,
        type: "personalization:decisions",
        payload: [],
      },
    ],
  };
  const expectedConsequenceWithCustomEcidResponse = {
    requestId: "mocked-uuid",
    handle: [
      {
        payload: [
          {
            id: "test-ecid",
            namespace: {
              code: "ECID",
            },
            primary: true,
            authenticatedState: "ambiguous",
            xid: "test-xid",
          },
        ],
        type: "identity:result",
      },
      {
        eventIndex: 0,
        type: "personalization:decisions",
        payload: [
          {
            id: "test-id",
            scope: "test-scope",
          },
        ],
      },
    ],
  };
  const expectedEmptyConsequenceWithCustomEcidResponse = {
    requestId: "mocked-uuid",
    handle: [
      {
        payload: [
          {
            id: "test-ecid",
            namespace: {
              code: "ECID",
            },
          },
        ],
        type: "identity:result",
      },
      {
        eventIndex: 0,
        type: "personalization:decisions",
        payload: [],
      },
    ],
  };

  beforeEach(() => {
    rulesEngineExecuteMock.mockReset();
  });

  it("should return empty consequences for no events with fallback ECID", async () => {
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyNoEvents);
    expect(request).toStrictEqual(expectedEmptyConsequenceResponse);
  });

  it("should return empty consequences for empty events with fallback ECID", async () => {
    const requestBodyEmptyEvents = { events: [{}] };
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyEmptyEvents);
    expect(request).toStrictEqual(expectedEmptyConsequenceResponse);
  });

  it("should return empty consequences for events with empty ECID namespace", async () => {
    const requestBodyEmptyEvents = {
      xdm: {
        identityMap: {
          ECID: [],
        },
      },
    };
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyEmptyEvents);
    expect(request).toStrictEqual(expectedEmptyConsequenceResponse);
  });

  it("should return first ECID if there is no primary", async () => {
    const requestBodyEmptyEvents = {
      xdm: {
        identityMap: {
          ECID: [
            {
              id: "test-ecid",
            },
          ],
        },
      },
    };
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyEmptyEvents);
    expect(request).toStrictEqual(
      expectedEmptyConsequenceWithCustomEcidResponse,
    );
  });

  it("should return the rule evaluated consequences with fallback ECID", async () => {
    ruleEngineMock.mockImplementation(() => [
      {
        detail: {
          id: "test-id",
          scope: "test-scope",
        },
      },
    ]);
    const request = await sendEvent(clientOptions, requestBodyWithEcid);
    expect(request).toStrictEqual(expectedConsequenceWithCustomEcidResponse);
  });

  it("should log if multiple and different ECID's are found", async () => {
    ruleEngineMock.mockImplementation(() => {
      throw new Error("Invalid rules");
    });

    await sendEvent(clientOptions, requestBodyWithEcid);
    expect(logMock).toBeCalled();
  });
});

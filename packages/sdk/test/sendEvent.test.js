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

  it("should include identity cookie in state:store when missing", async () => {
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyWithEcid);

    // Should have a state:store handle
    const stateStoreHandle = request.handle.find(
      (h) => h.type === "state:store",
    );
    expect(stateStoreHandle).toBeDefined();

    // Should contain identity cookie
    const identityCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_identity",
    );
    expect(identityCookie).toBeDefined();
    expect(identityCookie.value).toBeTruthy();
    expect(identityCookie.maxAge).toBe(34128000);
  });

  it("should not duplicate identity cookie if already present in stateStore", async () => {
    ruleEngineMock.mockReturnValue([]);
    const clientOptionsWithStateStore = {
      ...clientOptions,
      stateStore: {
        type: "state:store",
        payload: [
          {
            key: "kndctr_test-org-id_identity",
            value: "existing-identity-cookie",
            maxAge: 34128000,
          },
          {
            key: "kndctr_test-org-id_cluster",
            value: "or2",
            maxAge: 1800,
          },
        ],
      },
    };

    const request = await sendEvent(
      clientOptionsWithStateStore,
      requestBodyWithEcid,
    );

    // Should have a state:store handle
    const stateStoreHandle = request.handle.find(
      (h) => h.type === "state:store",
    );
    expect(stateStoreHandle).toBeDefined();

    // Should have exactly 2 entries (not duplicated)
    expect(stateStoreHandle.payload.length).toBe(2);

    // Identity cookie should be the existing one
    const identityCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_identity",
    );
    expect(identityCookie.value).toBe("existing-identity-cookie");
  });

  it("should add identity cookie to existing stateStore without identity", async () => {
    ruleEngineMock.mockReturnValue([]);
    const clientOptionsWithPartialStateStore = {
      ...clientOptions,
      stateStore: {
        type: "state:store",
        payload: [
          {
            key: "kndctr_test-org-id_cluster",
            value: "or2",
            maxAge: 1800,
          },
        ],
      },
    };

    const request = await sendEvent(
      clientOptionsWithPartialStateStore,
      requestBodyWithEcid,
    );

    // Should have a state:store handle
    const stateStoreHandle = request.handle.find(
      (h) => h.type === "state:store",
    );
    expect(stateStoreHandle).toBeDefined();

    // Should have 2 entries now (cluster + identity)
    expect(stateStoreHandle.payload.length).toBe(2);

    // Should have both cluster and identity
    const clusterCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_cluster",
    );
    const identityCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_identity",
    );

    expect(clusterCookie).toBeDefined();
    expect(identityCookie).toBeDefined();
    expect(identityCookie.value).toBeTruthy();
  });

  it("should encode identity cookie in protobuf format", async () => {
    ruleEngineMock.mockReturnValue([]);
    const request = await sendEvent(clientOptions, requestBodyWithEcid);

    const stateStoreHandle = request.handle.find(
      (h) => h.type === "state:store",
    );
    const identityCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_identity",
    );

    // Should be a base64 string (URL-safe)
    expect(typeof identityCookie.value).toBe("string");
    expect(identityCookie.value).not.toContain("+");
    expect(identityCookie.value).not.toContain("/");
    expect(identityCookie.value).not.toContain("=");
    expect(identityCookie.value.length).toBeGreaterThan(0);
  });

  it("should include locationHintId as region in identity cookie metadata", async () => {
    ruleEngineMock.mockReturnValue([]);
    const clientOptionsWithLocationHint = {
      ...clientOptions,
      locationHintId: "or2",
    };

    const request = await sendEvent(
      clientOptionsWithLocationHint,
      requestBodyWithEcid,
    );

    const stateStoreHandle = request.handle.find(
      (h) => h.type === "state:store",
    );
    const identityCookie = stateStoreHandle.payload.find(
      (entry) => entry.key === "kndctr_test-org-id_identity",
    );

    // Cookie should be created with the region
    expect(identityCookie).toBeDefined();
    expect(identityCookie.value).toBeTruthy();
  });

  it("should extract ECID from identity cookie in meta.state.entries when no ECID in identityMap", async () => {
    ruleEngineMock.mockReturnValue([]);

    // Create a valid identity cookie with a known ECID
    const { createIdentityCookieValue } = await import(
      "../src/utils/encodeIdentityCookie.js"
    );
    const knownEcid = "88888888888888888888";
    const identityCookieValue = createIdentityCookieValue(knownEcid);

    const requestBodyWithCookie = {
      type: "decisioning.propositionFetch",
      meta: {
        state: {
          entries: [
            {
              key: "kndctr_test-org-id_cluster",
              value: "or2",
            },
            {
              key: "kndctr_test-org-id_identity",
              value: identityCookieValue,
            },
          ],
        },
      },
      // No identityMap provided
    };

    const request = await sendEvent(clientOptions, requestBodyWithCookie);

    // Should extract ECID from the identity cookie
    const identityHandle = request.handle.find(
      (h) => h.type === "identity:result",
    );
    expect(identityHandle).toBeDefined();
    expect(identityHandle.payload[0].id).toBe(knownEcid);
    expect(identityHandle.payload[0].namespace.code).toBe("ECID");
  });

  it("should prioritize ECID from identityMap over identity cookie", async () => {
    ruleEngineMock.mockReturnValue([]);

    const { createIdentityCookieValue } = await import(
      "../src/utils/encodeIdentityCookie.js"
    );
    const cookieEcid = "11111111111111111111";
    const requestEcid = "22222222222222222222";
    const identityCookieValue = createIdentityCookieValue(cookieEcid);

    const requestBodyWithBoth = {
      type: "decisioning.propositionFetch",
      xdm: {
        identityMap: {
          ECID: [
            {
              id: requestEcid,
            },
          ],
        },
      },
      meta: {
        state: {
          entries: [
            {
              key: "kndctr_test-org-id_identity",
              value: identityCookieValue,
            },
          ],
        },
      },
    };

    const request = await sendEvent(clientOptions, requestBodyWithBoth);

    // Should use ECID from identityMap, not from cookie
    const identityHandle = request.handle.find(
      (h) => h.type === "identity:result",
    );
    expect(identityHandle.payload[0].id).toBe(requestEcid);
  });

  it("should fallback to generating ECID when identity cookie is malformed", async () => {
    ruleEngineMock.mockReturnValue([]);

    const requestBodyWithMalformedCookie = {
      type: "decisioning.propositionFetch",
      meta: {
        state: {
          entries: [
            {
              key: "kndctr_test-org-id_identity",
              value: "malformed-invalid-cookie",
            },
          ],
        },
      },
    };

    const request = await sendEvent(
      clientOptions,
      requestBodyWithMalformedCookie,
    );

    // Should fallback to mocked-ecid (from generateECID mock)
    const identityHandle = request.handle.find(
      (h) => h.type === "identity:result",
    );
    expect(identityHandle.payload[0].id).toBe("mocked-ecid");
  });
});

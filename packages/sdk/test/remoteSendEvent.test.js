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

const edgeRequesterMock = jest.fn();
jest.unstable_mockModule("../src/edgeRequester.js", () => ({
  edgeRequester: edgeRequesterMock,
}));

const { remoteSendEvent } = await import("../src/remoteSendEvent.js");

describe("remoteSendEvent", () => {
  const clientOptions = {
    orgId: "test-org-id",
    datastreamId: "test-datastream",
  };
  const requestBody = {
    prop1: "test-request-body",
  };

  it("should be called with the interact endpoint", () => {
    remoteSendEvent(clientOptions, requestBody);
    expect(edgeRequesterMock).toBeCalledWith(clientOptions, "interact", {
      ...requestBody,
      event: {
        xdm: requestBody.xdm,
      },
      query: requestBody.query,
      meta: requestBody.meta,
    });
  });
});

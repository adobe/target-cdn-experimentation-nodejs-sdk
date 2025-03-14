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

const actualContainer = await import("../../../src/container.js");
jest.unstable_mockModule("../../../src/container.js", async () => {
  return {
    TOKENS: actualContainer.TOKENS,
    Container: jest.fn().mockImplementation(() => ({
      getInstance: () => "test",
    })),
  };
});

jest.unstable_mockModule("../../../src/utils/uuid/v4.js", () => ({
  v4: jest.fn().mockImplementation(() => "mocked-uuid"),
}));

const { uuid } = await import("../../../src/utils/uuid/index.js");

describe("uuid", () => {
  it("should equal the returned value from the v4 function", () => {
    const result = uuid();
    expect(result).toEqual("mocked-uuid");
  });
});

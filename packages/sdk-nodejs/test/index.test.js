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
import { describe, it, expect, jest } from "@jest/globals";
import { TOKENS } from "../../sdk/src/container.js";

const BaseClientMock = jest.fn();
jest.unstable_mockModule("../../sdk/src/index.js", () => ({
  BaseClient: BaseClientMock,
}));
const registerInstanceMock = jest.fn();
const actualContainer = await import("../../sdk/src/container.js");
jest.unstable_mockModule("../../sdk/src/container.js", async () => {
  return {
    TOKENS: actualContainer.TOKENS,
    Container: jest.fn().mockImplementation(() => ({
      registerInstance: registerInstanceMock,
    })),
  };
});
jest.unstable_mockModule("../src/uuid/rng.js", () => ({
  rng: jest.fn(),
}));
jest.unstable_mockModule("../src/httpRequestAdapter.js", () => ({
  httpRequestAdapterInstance: jest.fn(),
}));
jest.unstable_mockModule("@adobe/target-cdn-experimentation-core", () => ({
  BaseClient: BaseClientMock,
  TOKENS: actualContainer.TOKENS,
  Container: jest.fn().mockImplementation(() => ({
    registerInstance: registerInstanceMock,
  })),
}));

const { Client } = await import("../src/index.js");

describe("Client", () => {
  it("should return a BaseClient instance", () => {
    const clientOptions = {};
    Client(clientOptions);
    expect(registerInstanceMock).toHaveBeenCalledWith(
      TOKENS.RNG,
      expect.any(Function),
    );
    expect(registerInstanceMock).toHaveBeenCalledWith(
      TOKENS.HTTP_CLIENT,
      expect.any(Function),
    );
    expect(registerInstanceMock).toHaveBeenCalledWith(TOKENS.LOGGER, console);
    expect(BaseClientMock).toHaveBeenCalledWith(clientOptions);
  });
});

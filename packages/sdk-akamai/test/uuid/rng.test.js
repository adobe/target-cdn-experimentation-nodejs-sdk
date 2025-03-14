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

const getRandomValuesMock = jest.fn();
jest.unstable_mockModule("crypto", () => ({
  crypto: {
    getRandomValues: getRandomValuesMock,
  },
}));

const { rng } = await import("../../src/uuid/rng.js");

describe("rng", () => {
  it("should return a random array of bits", () => {
    const result = new Uint8Array(256).fill(0);
    getRandomValuesMock.mockImplementation(() => result);
    expect(rng()).toEqual(result);
  });
});

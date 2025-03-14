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

const randomFillSyncMock = jest.fn();
jest.unstable_mockModule("crypto", () => ({
  default: {
    randomFillSync: randomFillSyncMock,
  },
}));

const { rng } = await import("../../src/uuid/rng.js");

describe("rng", () => {
  it("should return a random array of bits", () => {
    const buffer = new Uint8Array(256);
    randomFillSyncMock.mockImplementation((buf) => buf.set(buffer));

    const result = rng();
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
    expect(randomFillSyncMock).toHaveBeenCalled();
  });

  it("should call crypto.randomFillSync when buffer is exhausted", () => {
    // Exhaust the buffer
    for (let i = 0; i < 16; i++) {
      rng();
    }
    // Call rng to trigger randomFillSync
    rng();
    expect(randomFillSyncMock).toHaveBeenCalled();
  });
});

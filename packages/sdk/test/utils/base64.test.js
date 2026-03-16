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

import { describe, it, expect } from "@jest/globals";
import { bytesToBase64, base64ToBytes } from "../../src/utils/base64.js";

describe("base64 encoding", () => {
  describe("bytesToBase64", () => {
    it("should encode bytes to URL-safe base64", () => {
      const bytes = [72, 101, 108, 108, 111]; // "Hello"
      const result = bytesToBase64(bytes);
      // Standard base64 would be "SGVsbG8="
      // URL-safe removes padding: "SGVsbG8"
      expect(result).toBe("SGVsbG8");
    });

    it("should handle Uint8Array input", () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = bytesToBase64(bytes);
      expect(result).toBe("SGVsbG8");
    });

    it("should replace + with - and / with _", () => {
      // Create bytes that would produce + and / in standard base64
      const bytes = [0xff, 0xff];
      const result = bytesToBase64(bytes);
      // Standard base64: "//8=" -> URL-safe: "__8"
      expect(result).not.toContain("+");
      expect(result).not.toContain("/");
      expect(result).not.toContain("=");
    });

    it("should remove padding", () => {
      const bytes = [72]; // "H"
      const result = bytesToBase64(bytes);
      // Standard base64 would be "SA=="
      // URL-safe removes padding: "SA"
      expect(result).toBe("SA");
      expect(result).not.toContain("=");
    });
  });

  describe("base64ToBytes", () => {
    it("should decode URL-safe base64 to bytes", () => {
      const base64 = "SGVsbG8";
      const result = base64ToBytes(base64);
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
    });

    it("should handle base64 with - and _", () => {
      const base64 = "__8";
      const result = base64ToBytes(base64);
      expect(Array.from(result)).toEqual([0xff, 0xff]);
    });

    it("should handle base64 without padding", () => {
      const base64 = "SA";
      const result = base64ToBytes(base64);
      expect(Array.from(result)).toEqual([72]);
    });
  });

  describe("round-trip encoding", () => {
    it("should encode and decode correctly", () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const encoded = bytesToBase64(original);
      const decoded = base64ToBytes(encoded);
      expect(Array.from(decoded)).toEqual(original);
    });
  });
});


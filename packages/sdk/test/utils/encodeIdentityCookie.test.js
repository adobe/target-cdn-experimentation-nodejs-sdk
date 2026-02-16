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

import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import {
  encodeIdentityProtobuf,
  createIdentityCookieValue,
} from "../../src/utils/encodeIdentityCookie.js";
import { base64ToBytes } from "../../src/utils/base64.js";

describe("identity cookie encoding", () => {
  describe("encodeIdentityProtobuf", () => {
    it("should encode ECID as field 1", () => {
      const ecid = "12345678901234567890";
      const result = encodeIdentityProtobuf(ecid);

      // First byte should be tag for field 1, wire type 2 (LEN)
      // (1 << 3) | 2 = 0x0a
      expect(result[0]).toBe(0x0a);

      // Second byte should be length of ECID
      expect(result[1]).toBe(ecid.length);

      // Should contain the ECID
      expect(result.length).toBeGreaterThan(ecid.length);
    });

    it("should encode metadata when provided", () => {
      const ecid = "12345678901234567890";
      const metadata = {
        createdAt: 1234567890,
        isNew: true,
        deviceType: 0,
        source: 0,
        region: "or2",
      };

      const result = encodeIdentityProtobuf(ecid, { metadata });

      // Should be longer than just ECID encoding
      expect(result.length).toBeGreaterThan(ecid.length + 2);

      // Should contain metadata field tag (field 10, wire type 2)
      // (10 << 3) | 2 = 82 = 0x52
      expect(result).toContain(0x52);
    });

    it("should encode writeTime when provided", () => {
      const ecid = "12345678901234567890";
      const writeTime = 1234567890;

      const result = encodeIdentityProtobuf(ecid, { writeTime });

      // Should contain writeTime field tag (field 30, wire type 0)
      // (30 << 3) | 0 = 240 = 0xF0
      expect(result).toContain(0xf0);
    });
  });

  describe("createIdentityCookieValue", () => {
    beforeEach(() => {
      // Mock Date.now() to return a fixed timestamp
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should create a base64-encoded identity cookie", () => {
      const ecid = "12345678901234567890";
      const result = createIdentityCookieValue(ecid);

      // Should be a non-empty string
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");

      // Should be URL-safe base64 (no +, /, or =)
      expect(result).not.toContain("+");
      expect(result).not.toContain("/");
      expect(result).not.toContain("=");
    });

    it("should create a decodable protobuf message", () => {
      const ecid = "12345678901234567890";
      const result = createIdentityCookieValue(ecid);

      // Decode the base64
      const bytes = base64ToBytes(result);

      // First field should be ECID (field 1, wire type 2)
      expect(bytes[0]).toBe(0x0a);
      expect(bytes[1]).toBe(ecid.length);
    });

    it("should include metadata by default", () => {
      const ecid = "12345678901234567890";
      const result = createIdentityCookieValue(ecid);

      const bytes = base64ToBytes(result);

      // Should contain metadata field (field 10, wire type 2 = 0x52)
      expect(Array.from(bytes)).toContain(0x52);
    });

    it("should accept custom isNew flag", () => {
      const ecid = "12345678901234567890";
      const result = createIdentityCookieValue(ecid, { isNew: false });

      // Should still be a valid base64 string
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should accept custom region", () => {
      const ecid = "12345678901234567890";
      const result = createIdentityCookieValue(ecid, { region: "or2" });

      const bytes = base64ToBytes(result);

      // Should contain the region string "or2" somewhere in the bytes
      const decoder = new TextDecoder();
      const str = decoder.decode(bytes);
      expect(str).toContain("or2");
    });

    it("should create different values for different ECIDs", () => {
      const ecid1 = "11111111111111111111";
      const ecid2 = "22222222222222222222";

      const result1 = createIdentityCookieValue(ecid1);
      const result2 = createIdentityCookieValue(ecid2);

      expect(result1).not.toBe(result2);
    });

    it("should match expected format from Alloy examples", () => {
      // This is a general format check, not an exact match
      // since timestamps will differ
      const ecid = "75142138344462263894507331812511658810";
      const result = createIdentityCookieValue(ecid, { region: "OR2" });

      // Should be a reasonably long base64 string
      expect(result.length).toBeGreaterThan(50);

      // Should start with the ECID field encoding
      const bytes = base64ToBytes(result);
      expect(bytes[0]).toBe(0x0a); // Field 1, wire type 2
    });
  });
});


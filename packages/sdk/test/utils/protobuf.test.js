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
import {
  encodeVarint,
  encodeString,
  encodeInt64,
  encodeInt32,
  encodeBool,
} from "../../src/utils/protobuf.js";

describe("protobuf encoding", () => {
  describe("encodeVarint", () => {
    it("should encode small values in a single byte", () => {
      expect(encodeVarint(0)).toEqual([0]);
      expect(encodeVarint(1)).toEqual([1]);
      expect(encodeVarint(127)).toEqual([127]);
    });

    it("should encode larger values in multiple bytes", () => {
      // 150 = 10010110 00000001 in varint encoding
      expect(encodeVarint(150)).toEqual([0x96, 0x01]);
    });

    it("should encode 300", () => {
      // 300 = 0xAC 0x02 in varint encoding
      expect(encodeVarint(300)).toEqual([0xac, 0x02]);
    });
  });

  describe("encodeString", () => {
    it("should encode a string with tag and length", () => {
      const result = encodeString(1, "test");
      // Field 1, wire type 2 (LEN) = tag 0x0a
      // Length 4
      // UTF-8 bytes for "test"
      expect(result).toEqual([0x0a, 0x04, 0x74, 0x65, 0x73, 0x74]);
    });

    it("should return empty array for empty string", () => {
      expect(encodeString(1, "")).toEqual([]);
    });

    it("should return empty array for null", () => {
      expect(encodeString(1, null)).toEqual([]);
    });

    it("should encode ECID correctly", () => {
      const ecid = "12345678901234567890";
      const result = encodeString(1, ecid);
      // Tag for field 1, wire type 2
      expect(result[0]).toBe(0x0a);
      // Length should be 20
      expect(result[1]).toBe(20);
      // Should contain the ECID bytes
      expect(result.length).toBe(2 + 20);
    });
  });

  describe("encodeInt64", () => {
    it("should encode an int64 with tag and varint value", () => {
      const result = encodeInt64(30, 1234567890);
      // Field 30, wire type 0 (VARINT) = tag 240 (0xF0)
      expect(result[0]).toBe(240);
      // Followed by varint encoding of 1234567890
      expect(result.length).toBeGreaterThan(1);
    });

    it("should return empty array for null", () => {
      expect(encodeInt64(1, null)).toEqual([]);
    });

    it("should return empty array for undefined", () => {
      expect(encodeInt64(1, undefined)).toEqual([]);
    });
  });

  describe("encodeInt32", () => {
    it("should encode an int32 with tag and varint value", () => {
      const result = encodeInt32(3, 1);
      // Field 3, wire type 0 (VARINT) = tag 24 (0x18)
      expect(result[0]).toBe(24);
      expect(result[1]).toBe(1);
    });

    it("should return empty array for null", () => {
      expect(encodeInt32(1, null)).toEqual([]);
    });
  });

  describe("encodeBool", () => {
    it("should encode true as 1", () => {
      const result = encodeBool(2, true);
      // Field 2, wire type 0 (VARINT) = tag 16 (0x10)
      expect(result[0]).toBe(16);
      expect(result[1]).toBe(1);
    });

    it("should encode false as 0", () => {
      const result = encodeBool(2, false);
      // Field 2, wire type 0 (VARINT) = tag 16 (0x10)
      expect(result[0]).toBe(16);
      expect(result[1]).toBe(0);
    });

    it("should return empty array for null", () => {
      expect(encodeBool(1, null)).toEqual([]);
    });
  });
});


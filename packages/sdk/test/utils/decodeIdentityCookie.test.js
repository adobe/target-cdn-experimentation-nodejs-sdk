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
  extractEcidFromIdentityCookie,
  getEcidFromStateEntries,
} from "../../src/utils/decodeIdentityCookie.js";
import { createIdentityCookieValue } from "../../src/utils/encodeIdentityCookie.js";

describe("identity cookie decoding", () => {
  describe("extractEcidFromIdentityCookie", () => {
    it("should extract ECID from a valid identity cookie", () => {
      const ecid = "12345678901234567890";
      const cookieValue = createIdentityCookieValue(ecid);

      const extractedEcid = extractEcidFromIdentityCookie(cookieValue);
      expect(extractedEcid).toBe(ecid);
    });

    it("should extract ECID from a long ECID value", () => {
      const ecid = "75142138344462263894507331812511658810";
      const cookieValue = createIdentityCookieValue(ecid);

      const extractedEcid = extractEcidFromIdentityCookie(cookieValue);
      expect(extractedEcid).toBe(ecid);
    });

    it("should extract ECID with region metadata", () => {
      const ecid = "98765432109876543210";
      const cookieValue = createIdentityCookieValue(ecid, { region: "or2" });

      const extractedEcid = extractEcidFromIdentityCookie(cookieValue);
      expect(extractedEcid).toBe(ecid);
    });

    it("should return null for malformed cookie", () => {
      const malformedCookie = "not-a-valid-base64-protobuf";
      const extractedEcid = extractEcidFromIdentityCookie(malformedCookie);
      expect(extractedEcid).toBeNull();
    });

    it("should return null for empty string", () => {
      const extractedEcid = extractEcidFromIdentityCookie("");
      expect(extractedEcid).toBeNull();
    });

    it("should handle URL-encoded cookie values", () => {
      const ecid = "11111111111111111111";
      const cookieValue = createIdentityCookieValue(ecid);
      const urlEncodedValue = encodeURIComponent(cookieValue);

      const extractedEcid = extractEcidFromIdentityCookie(urlEncodedValue);
      expect(extractedEcid).toBe(ecid);
    });

    it("should round-trip encode and decode correctly", () => {
      const testEcids = [
        "12345",
        "12345678901234567890",
        "75142138344462263894507331812511658810",
        "00000000000000000000",
        "99999999999999999999",
      ];

      testEcids.forEach((ecid) => {
        const encoded = createIdentityCookieValue(ecid);
        const decoded = extractEcidFromIdentityCookie(encoded);
        expect(decoded).toBe(ecid);
      });
    });
  });

  describe("getEcidFromStateEntries", () => {
    const orgId = "TEST123@AdobeOrg";
    const ecid = "12345678901234567890";

    it("should extract ECID from state entries", () => {
      const cookieValue = createIdentityCookieValue(ecid);
      const stateEntries = [
        {
          key: "kndctr_TEST123_AdobeOrg_cluster",
          value: "or2",
        },
        {
          key: "kndctr_TEST123_AdobeOrg_identity",
          value: cookieValue,
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId, stateEntries);
      expect(extractedEcid).toBe(ecid);
    });

    it("should return null when state entries is null", () => {
      const extractedEcid = getEcidFromStateEntries(orgId, null);
      expect(extractedEcid).toBeNull();
    });

    it("should return null when state entries is undefined", () => {
      const extractedEcid = getEcidFromStateEntries(orgId, undefined);
      expect(extractedEcid).toBeNull();
    });

    it("should return null when state entries is not an array", () => {
      const extractedEcid = getEcidFromStateEntries(orgId, {});
      expect(extractedEcid).toBeNull();
    });

    it("should return null when identity cookie is not in entries", () => {
      const stateEntries = [
        {
          key: "kndctr_TEST123_AdobeOrg_cluster",
          value: "or2",
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId, stateEntries);
      expect(extractedEcid).toBeNull();
    });

    it("should return null when identity cookie has no value", () => {
      const stateEntries = [
        {
          key: "kndctr_TEST123_AdobeOrg_identity",
          value: "",
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId, stateEntries);
      expect(extractedEcid).toBeNull();
    });

    it("should return null when identity cookie is malformed", () => {
      const stateEntries = [
        {
          key: "kndctr_TEST123_AdobeOrg_identity",
          value: "malformed-cookie-value",
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId, stateEntries);
      expect(extractedEcid).toBeNull();
    });

    it("should handle different org IDs correctly", () => {
      const orgId2 = "DIFFERENT_ORG@AdobeOrg";
      const ecid2 = "99999999999999999999";
      const cookieValue = createIdentityCookieValue(ecid2);

      const stateEntries = [
        {
          key: "kndctr_DIFFERENT_ORG_AdobeOrg_identity",
          value: cookieValue,
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId2, stateEntries);
      expect(extractedEcid).toBe(ecid2);
    });

    it("should extract ECID from entries with multiple cookies", () => {
      const cookieValue = createIdentityCookieValue(ecid);
      const stateEntries = [
        {
          key: "kndctr_TEST123_AdobeOrg_cluster",
          value: "or2",
        },
        {
          key: "kndctr_TEST123_AdobeOrg_consent",
          value: "all",
        },
        {
          key: "kndctr_TEST123_AdobeOrg_identity",
          value: cookieValue,
        },
        {
          key: "some_other_cookie",
          value: "some_value",
        },
      ];

      const extractedEcid = getEcidFromStateEntries(orgId, stateEntries);
      expect(extractedEcid).toBe(ecid);
    });
  });
});


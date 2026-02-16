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
  getCookieName,
  getIdentityCookieName,
  getClusterCookieName,
} from "../../src/utils/getCookieName.js";

describe("cookie name helpers", () => {
  describe("getCookieName", () => {
    it("should create namespaced cookie name", () => {
      const orgId = "ABC123@AdobeOrg";
      const key = "identity";
      const result = getCookieName(orgId, key);
      expect(result).toBe("kndctr_ABC123_AdobeOrg_identity");
    });

    it("should replace @ with _", () => {
      const orgId = "TEST@AdobeOrg";
      const key = "test";
      const result = getCookieName(orgId, key);
      expect(result).not.toContain("@");
      expect(result).toContain("_");
    });

    it("should use kndctr prefix", () => {
      const orgId = "ABC@AdobeOrg";
      const key = "cluster";
      const result = getCookieName(orgId, key);
      expect(result).toMatch(/^kndctr_/);
    });
  });

  describe("getIdentityCookieName", () => {
    it("should create identity cookie name", () => {
      const orgId = "5BFE274A5F6980A50A495C08@AdobeOrg";
      const result = getIdentityCookieName(orgId);
      expect(result).toBe("kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity");
    });

    it("should match Alloy format", () => {
      const orgId = "ABC123@AdobeOrg";
      const result = getIdentityCookieName(orgId);
      expect(result).toBe("kndctr_ABC123_AdobeOrg_identity");
    });
  });

  describe("getClusterCookieName", () => {
    it("should create cluster cookie name", () => {
      const orgId = "5BFE274A5F6980A50A495C08@AdobeOrg";
      const result = getClusterCookieName(orgId);
      expect(result).toBe("kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster");
    });

    it("should match Alloy format", () => {
      const orgId = "ABC123@AdobeOrg";
      const result = getClusterCookieName(orgId);
      expect(result).toBe("kndctr_ABC123_AdobeOrg_cluster");
    });
  });
});


/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { describe, it, expect } from "@jest/globals";
import { createHash } from "node:crypto";
import { md5 } from "../../src/edge/md5.js";

describe("pure JS md5", () => {
  it.each([
    "",
    "a",
    "ADB3LETTERSANDNUMBERS@AdobeOrg:first-party-id-123",
    "The quick brown fox jumps over the lazy dog",
    "x".repeat(1000),
  ])("should match the Node.js md5 for %#", (input) => {
    expect(md5(input)).toBe(createHash("md5").update(input).digest("hex"));
  });
});

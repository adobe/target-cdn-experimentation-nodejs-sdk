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

// The pairs of UUID and ECID values are taken from the Mobile SDK Java implementation
// They validate that the ECID is generated correctly
const uuidEcidPairs = [
  {
    uuid: "12de78ab-0380-4a8d-9471-4e99f358a9bb",
    ecid: "13596568134059485577750327060608276037",
  },
  {
    uuid: "a20e1736-ee76-4385-8723-461a3cee4e0b",
    ecid: "67694476651948760278709040175899062773",
  },
  {
    uuid: "acd96d5e-cb38-4418-8215-609e70cfe979",
    ecid: "59916375753359185689073239640654222983",
  },
  {
    uuid: "db300161-ea12-46eb-8c67-0183069e418d",
    ecid: "26526186604707003098329687323535064691",
  },
];
const mockUuid = jest.fn();
jest.unstable_mockModule("../../../src/utils/uuid/index.js", () => ({
  uuid: mockUuid,
}));

const { generateECID } = await import("../../../src/utils/generateECID.js");

describe("generateECID", () => {
  it("should return the correct ECID, exact values as in the Java implementation", () => {
    uuidEcidPairs.forEach((pair) => {
      mockUuid.mockImplementationOnce(() => pair.uuid);
      const result = generateECID();
      expect(result).toEqual(pair.ecid);
    });
  });
});

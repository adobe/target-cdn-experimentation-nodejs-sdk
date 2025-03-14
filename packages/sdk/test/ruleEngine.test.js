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

const RulesEngineMock = jest.fn();
jest.unstable_mockModule("@adobe/aep-rules-engine", () => ({
  default: RulesEngineMock,
}));

const { RuleEngine } = await import("../src/ruleEngine.js");

describe("ruleEngine", () => {
  const options = {
    rules: { prop: "value" },
  };
  it("should return a ruleEngine instance", () => {
    RulesEngineMock.mockImplementationOnce(() => {
      return {
        execute: () => {},
      };
    });
    RuleEngine(options);
    expect(RulesEngineMock).toHaveBeenCalledWith(options.rules);
  });
  it("should throw an error if the rules are invalid", () => {
    RulesEngineMock.mockImplementationOnce(() => {
      throw new Error("Invalid rules");
    });
    expect(() => {
      RuleEngine(options);
    }).toThrow();
  });
});

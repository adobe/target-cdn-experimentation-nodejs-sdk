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

import { flatten } from "../..//src/utils/flatten.js";

const plainObject = {
  prop1: "value1",
  prop2: 2,
  prop3: true,
  prop4: null,
  prop5: undefined,
};
const expectedPlainObject = {
  prop1: "value1",
  prop2: 2,
  prop3: true,
  prop4: null,
  prop5: undefined,
};
const complexObject = {
  level1: { ...plainObject },
  anotherProp: "valueAnotherProp",
  withArray: [1, 2, "3"],
};
const expectedComplexObject = {
  "level1.prop1": "value1",
  "level1.prop2": 2,
  "level1.prop3": true,
  "level1.prop4": null,
  "level1.prop5": undefined,
  "withArray.0": 1,
  "withArray.1": 2,
  "withArray.2": "3",
  anotherProp: "valueAnotherProp",
};

describe("flatten object function", () => {
  it("should return the input value if it's not an object", () => {
    expect(flatten(34)).toEqual(34);
  });

  it("should return a plain object", () => {
    expect(flatten(plainObject)).toEqual(expectedPlainObject);
  });

  it("should flatten a complex object", () => {
    expect(flatten(complexObject)).toEqual(expectedComplexObject);
  });
});

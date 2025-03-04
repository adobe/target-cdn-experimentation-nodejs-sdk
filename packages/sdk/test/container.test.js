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

const { Container } = await import("sdk/src/container.js");

describe("container", () => {
  it("should return the same Container instance", () => {
    expect(Container()).toStrictEqual(Container());
  });
  it("should register an instance and return the same object reference", () => {
    const obj = { prop: 1 };
    Container().registerInstance("test", obj);
    expect(Container().getInstance("test")).toStrictEqual(obj);

    obj.prop = 2;
    expect(Container().getInstance("test")).toStrictEqual(obj);

    const copy_obj = Object.assign({}, obj);
    const isSameReferenceWithObj = Container().getInstance("test") === obj;
    const isSameReferenceWithCopyObj =
      Container().getInstance("test") === copy_obj;

    expect(isSameReferenceWithObj).toStrictEqual(true);
    expect(isSameReferenceWithCopyObj).toStrictEqual(false);
  });
  it("should not register/overwrite the same instance twice", () => {
    const obj = { prop: 1 };
    const copy_obj = Object.assign({}, obj);
    Container().registerInstance("obj", obj);
    Container().registerInstance("obj", copy_obj);

    const isSameReferenceWithObj = Container().getInstance("obj") === obj;
    const isSameReferenceWithCopyObj =
      Container().getInstance("obj") === copy_obj;

    expect(isSameReferenceWithObj).toStrictEqual(true);
    expect(isSameReferenceWithCopyObj).toStrictEqual(false);
  });
  it("should throw an error if it's doesn't have a instance", () => {
    expect(() => {
      Container().getInstance("IDontExist");
    }).toThrow();
  });
});

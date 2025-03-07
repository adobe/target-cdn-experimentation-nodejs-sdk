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

const isPlainObject = (obj) => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
};

const flattenObject = (obj, result = {}, keys = []) => {
  Object.keys(obj).forEach((key) => {
    if (isPlainObject(obj[key]) || Array.isArray(obj[key])) {
      flattenObject(obj[key], result, [...keys, key]);
    } else {
      result[[...keys, key].join(".")] = obj[key];
    }
  });

  return result;
};

export const flatten = (obj) => {
  if (!isPlainObject(obj)) {
    return obj;
  }

  return flattenObject(obj);
};

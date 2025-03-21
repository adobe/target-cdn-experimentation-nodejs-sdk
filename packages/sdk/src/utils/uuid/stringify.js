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

const join = (joiner, collection) => {
  if (!Array.isArray(collection)) {
    return "";
  }

  return collection.join(joiner || "");
};
const createByteToHex = () => {
  const result = [];

  for (let i = 0; i < 256; i += 1) {
    result.push((i + 0x100).toString(16).substr(1));
  }

  return result;
};

const BYTE_TO_HEX = createByteToHex();

export const stringify = (arr) => {
  const result = [];

  for (let i = 0; i < 16; i += 1) {
    // Convert array of 16 byte values to UUID string format of the form: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
    if ([4, 6, 8, 10].includes(i)) {
      result.push("-");
    }
    result.push(BYTE_TO_HEX[arr[i]]);
  }

  return join("", result).toLowerCase();
};

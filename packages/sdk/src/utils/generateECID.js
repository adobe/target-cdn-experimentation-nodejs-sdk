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

import { uuid } from "./uuid/index.js";

function createBigIntFromParts(low, high) {
  low = BigInt.asUintN(32, BigInt(low));
  high = BigInt.asUintN(32, BigInt(high));
  const combined = (high << 32n) | low;
  return BigInt.asIntN(64, combined);
}
function uuidFromString(uuidString) {
  const cleanedUuid = uuidString.replace(/-/g, "");
  let high32Bits = 0;
  let low32Bits = 0;

  for (let i = 0, offset = 24; i < 8; i += 2, offset -= 8) {
    high32Bits |= parseInt(cleanedUuid.substring(i, i + 2), 16) << offset;
  }

  for (let i = 8, offset = 24; i < 16; i += 2, offset -= 8) {
    low32Bits |= parseInt(cleanedUuid.substring(i, i + 2), 16) << offset;
  }

  const high64BigInt = createBigIntFromParts(low32Bits, high32Bits);

  high32Bits = 0;
  low32Bits = 0;

  for (let i = 16, offset = 24; i < 24; i += 2, offset -= 8) {
    high32Bits |= parseInt(cleanedUuid.substring(i, i + 2), 16) << offset;
  }

  for (let i = 24, offset = 24; i < 32; i += 2, offset -= 8) {
    low32Bits |= parseInt(cleanedUuid.substring(i, i + 2), 16) << offset;
  }

  const low64BigInt = createBigIntFromParts(low32Bits, high32Bits);
  return { low64BigInt, high64BigInt };
}

const generateECID = () => {
  const generatedUuid = uuid();
  const { low64BigInt, high64BigInt } = uuidFromString(generatedUuid);

  const positiveHigh = high64BigInt?.toString().replaceAll("-", "");
  const positiveLow = low64BigInt?.toString().replaceAll("-", "");

  return positiveHigh + positiveLow;
};

export { generateECID };

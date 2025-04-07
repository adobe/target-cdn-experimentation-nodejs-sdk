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
import { Container, TOKENS } from "../container.js";

const SECTION_LENGTH = 19;

const uuidFromString = (uuidString) => {
  const cleanedUuid = uuidString.replace(/-/g, "");

  // Convert first 16 chars to high64BigInt
  const highHex = cleanedUuid.slice(0, 16);
  const high64BigInt = BigInt.asIntN(64, BigInt(`0x${highHex}`));

  // Convert last 16 chars to low64BigInt
  const lowHex = cleanedUuid.slice(16, 32);
  const low64BigInt = BigInt.asIntN(64, BigInt(`0x${lowHex}`));

  return { low64BigInt, high64BigInt };
};

const generateECID = () => {
  const generatedUuid = uuid();
  const { low64BigInt, high64BigInt } = uuidFromString(generatedUuid);

  const positiveHigh = high64BigInt?.toString().replaceAll("-", "");
  const positiveLow = low64BigInt?.toString().replaceAll("-", "");

  return (
    positiveHigh.padStart(SECTION_LENGTH, "0") +
    positiveLow.padStart(SECTION_LENGTH, "0")
  );
};

const generateEcidFromFpid = (orgId, fpid) => {
  const md5 = Container().getInstance(TOKENS.MD5);
  const generatedUuid = md5(`${orgId}:${fpid}`);

  const { low64BigInt, high64BigInt } = uuidFromString(generatedUuid);
  const MAX_VALUE = BigInt("9223372036854775807"); // Long.MAX_VALUE from Java; gets rid of the negative sign, if number is negative

  const positiveHigh = (high64BigInt & MAX_VALUE)
    ?.toString()
    .replaceAll("-", "");

  const positiveLow = (low64BigInt & MAX_VALUE)?.toString().replaceAll("-", "");

  return (
    positiveHigh.padStart(SECTION_LENGTH, "0") +
    positiveLow.padStart(SECTION_LENGTH, "0")
  );
};

export { generateECID, generateEcidFromFpid };

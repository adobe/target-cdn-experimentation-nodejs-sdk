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

import {
  encodeString,
  encodeInt64,
  encodeInt32,
  encodeBool,
  encodeMessage,
} from "./protobuf.js";
import { bytesToBase64 } from "./base64.js";

/**
 * Protobuf field numbers for Identity message
 * Based on the schema from Alloy:
 * https://git.corp.adobe.com/experience-edge/konductor/blob/master/feature-identity/src/main/kotlin/com/adobe/edge/features/identity/data/StoredIdentity.kt
 */
const IDENTITY_FIELDS = {
  ECID: 1,
  METADATA: 10,
  LAST_SYNC: 20,
  SYNC_HASH: 21,
  ID_SYNC_CONTAINER_ID: 22,
  WRITE_TIME: 30,
};

/**
 * Protobuf field numbers for IdentityMetadata message
 */
const METADATA_FIELDS = {
  CREATED_AT: 1,
  IS_NEW: 2,
  DEVICE_TYPE: 3,
  REGION: 5,
  SOURCE: 6,
};

/**
 * Device type enum values
 */
const DEVICE_TYPE = {
  UNKNOWN: 0,
  BROWSER: 1,
  MOBILE: 2,
};

/**
 * Source enum values
 */
const SOURCE = {
  RANDOM: 0,
  THIRD_PARTY_ID: 1,
  FIRST_PARTY_ID: 2,
  RECEIVED_IN_REQUEST: 3,
};

/**
 * Encodes IdentityMetadata as a protobuf message.
 *
 * @param {Object} metadata - The metadata object
 * @param {number} metadata.createdAt - UNIX timestamp when identity was created
 * @param {boolean} metadata.isNew - Whether the identity is new
 * @param {number} metadata.deviceType - Device type (0=UNKNOWN, 1=BROWSER, 2=MOBILE)
 * @param {string} [metadata.region] - Edge region
 * @param {number} metadata.source - Source of the identity (0=RANDOM, etc.)
 * @returns {number[]} Encoded metadata bytes
 */
const encodeMetadata = (metadata) => {
  const bytes = [];

  // Field 1: created_at (int64)
  if (metadata.createdAt !== undefined) {
    bytes.push(...encodeInt64(METADATA_FIELDS.CREATED_AT, metadata.createdAt));
  }

  // Field 2: is_new (bool)
  if (metadata.isNew !== undefined) {
    bytes.push(...encodeBool(METADATA_FIELDS.IS_NEW, metadata.isNew));
  }

  // Field 3: device_type (int32)
  if (metadata.deviceType !== undefined) {
    bytes.push(...encodeInt32(METADATA_FIELDS.DEVICE_TYPE, metadata.deviceType));
  }

  // Field 5: region (string)
  if (metadata.region) {
    bytes.push(...encodeString(METADATA_FIELDS.REGION, metadata.region));
  }

  // Field 6: source (int32)
  if (metadata.source !== undefined) {
    bytes.push(...encodeInt32(METADATA_FIELDS.SOURCE, metadata.source));
  }

  return bytes;
};

/**
 * Encodes an Identity protobuf message.
 *
 * @param {string} ecid - The ECID value
 * @param {Object} [options] - Optional parameters
 * @param {Object} [options.metadata] - Identity metadata
 * @param {number} [options.writeTime] - UNIX timestamp when identity was written
 * @returns {number[]} Encoded identity bytes
 */
export const encodeIdentityProtobuf = (ecid, options = {}) => {
  const bytes = [];

  // Field 1: ecid (string) - Required
  bytes.push(...encodeString(IDENTITY_FIELDS.ECID, ecid));

  // Field 10: metadata (message) - Optional
  if (options.metadata) {
    const metadataBytes = encodeMetadata(options.metadata);
    if (metadataBytes.length > 0) {
      bytes.push(...encodeMessage(IDENTITY_FIELDS.METADATA, metadataBytes));
    }
  }

  // Field 30: write_time (int64) - Optional
  if (options.writeTime !== undefined) {
    bytes.push(...encodeInt64(IDENTITY_FIELDS.WRITE_TIME, options.writeTime));
  }

  return bytes;
};

/**
 * Creates an identity cookie value (base64-encoded protobuf).
 *
 * @param {string} ecid - The ECID value
 * @param {Object} [options] - Optional parameters
 * @param {boolean} [options.isNew] - Whether the identity is new (default: true)
 * @param {string} [options.region] - Edge region
 * @param {string} [options.source] - Source of the ECID (e.g., "RANDOM", "FIRST_PARTY_ID", "RECEIVED_IN_REQUEST")
 * @returns {string} Base64-encoded identity cookie value
 */
export const createIdentityCookieValue = (ecid, options = {}) => {
  // Use milliseconds to match Konductor's UnixTimestampSerializer
  const currentTimestamp = Date.now(); // milliseconds since epoch

  // Map source string to SOURCE enum value
  let sourceValue = SOURCE.RANDOM; // Default
  if (options.source) {
    sourceValue = SOURCE[options.source] !== undefined
      ? SOURCE[options.source]
      : SOURCE.RANDOM;
  }
  //This is metadata format which we follow from alloy
  const metadata = {
    createdAt: currentTimestamp,
    isNew: options.isNew !== undefined ? options.isNew : true,
    deviceType: DEVICE_TYPE.UNKNOWN, // Server-side, so unknown
    source: sourceValue,
    region: options.region || "",
  };

  const identityBytes = encodeIdentityProtobuf(ecid, {
    metadata,
    writeTime: currentTimestamp,
  });

  return bytesToBase64(identityBytes);
};

export { DEVICE_TYPE, SOURCE };

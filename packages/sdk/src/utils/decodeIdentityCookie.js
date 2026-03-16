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

/* eslint-disable no-bitwise */

import { base64ToBytes } from "./base64.js";
import { getIdentityCookieName } from "./getCookieName.js";

const ECID_FIELD_NUMBER = 1;
const METADATA_FIELD_NUMBER = 10;
const WRITE_TIME_FIELD_NUMBER = 30;

// Metadata field numbers
const METADATA_FIELDS = {
  CREATED_AT: 1,
  IS_NEW: 2,
  DEVICE_TYPE: 3,
  REGION: 5,
  SOURCE: 6,
};

const WIRE_TYPES = {
  VARINT: 0,
  I64: 1,
  LEN: 2,
  SGROUP: 3,
  EGROUP: 4,
  I32: 5,
};

/**
 * Decodes a varint from a buffer starting at the given offset.
 * Uses BigInt to avoid JavaScript's 32-bit bitwise operation limitation.
 * @param {Uint8Array} buffer
 * @param {number} offset
 * @returns {{ value: number, length: number }}
 */
const decodeVarint = (buffer, offset) => {
  let value = 0n; // Use BigInt to handle 64-bit integers
  let length = 0;
  let byte;
  
  do {
    if (offset < 0 || offset + length >= buffer.length) {
      throw new Error("Invalid varint: buffer ended unexpectedly");
    }
    byte = buffer[offset + length];
    
    // Use BigInt arithmetic to avoid 32-bit limitations
    value |= BigInt(byte & 0x7f) << BigInt(7 * length);
    
    length += 1;
    
    if (length > 10) {
      throw new Error("Invalid varint: too long");
    }
  } while (byte & 0x80);
  
  // Convert BigInt to Number (safe for timestamps which are within Number.MAX_SAFE_INTEGER)
  return { value: Number(value), length };
};

/**
 * Converts UTF-8 bytes to a string (EdgeWorker-compatible).
 * @param {Uint8Array} bytes - The UTF-8 bytes to decode
 * @returns {string} The decoded string
 */
const utf8BytesToString = (bytes) => {
  let str = "";
  let i = 0;
  
  while (i < bytes.length) {
    const byte1 = bytes[i++];
    
    if (byte1 < 0x80) {
      // 1-byte character
      str += String.fromCharCode(byte1);
    } else if ((byte1 & 0xe0) === 0xc0) {
      // 2-byte character
      const byte2 = bytes[i++];
      str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
    } else if ((byte1 & 0xf0) === 0xe0) {
      // 3-byte character
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      str += String.fromCharCode(
        ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f),
      );
    } else if ((byte1 & 0xf8) === 0xf0) {
      // 4-byte character (surrogate pair)
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      const byte4 = bytes[i++];
      let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) |
                      ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
      codePoint -= 0x10000;
      str += String.fromCharCode(0xd800 + (codePoint >> 10));
      str += String.fromCharCode(0xdc00 + (codePoint & 0x3ff));
    }
  }
  
  return str;
};

/**
 * Decodes a protobuf-encoded identity cookie to extract the ECID.
 * @param {Uint8Array} buffer - The protobuf bytes
 * @returns {string} The ECID value
 */
const decodeKndctrProtobuf = (buffer) => {
  let offset = 0;
  let ecid = null;

  while (offset < buffer.length && !ecid) {
    // Decode the tag
    const { value: tag, length: tagLength } = decodeVarint(buffer, offset);
    offset += tagLength;

    // Extract wire type and field number
    const wireType = tag & 0b111;
    const fieldNumber = tag >> 3;

    // Check if this is the ECID field
    if (fieldNumber === ECID_FIELD_NUMBER) {
      if (wireType === WIRE_TYPES.LEN) {
        // Decode the length of the ECID string
        const fieldValueLength = decodeVarint(buffer, offset);
        offset += fieldValueLength.length;

        // Decode the ECID as UTF-8 string (EdgeWorker-compatible)
        ecid = utf8BytesToString(
          buffer.slice(offset, offset + fieldValueLength.value),
        );
        return ecid;
      }
    } else {
      // Skip fields we don't care about
      switch (wireType) {
        case WIRE_TYPES.VARINT:
          offset += decodeVarint(buffer, offset).length;
          break;
        case WIRE_TYPES.I64:
          offset += 8;
          break;
        case WIRE_TYPES.LEN: {
          const fieldValueLength = decodeVarint(buffer, offset);
          offset += fieldValueLength.length + fieldValueLength.value;
          break;
        }
        case WIRE_TYPES.SGROUP:
          break;
        case WIRE_TYPES.EGROUP:
          break;
        case WIRE_TYPES.I32:
          offset += 4;
          break;
        default:
          throw new Error(
            `Malformed kndctr cookie. Unknown wire type: ${wireType}`,
          );
      }
    }
  }

  throw new Error("No ECID found in cookie.");
};

/**
 * Decodes metadata from a protobuf message.
 * @param {Uint8Array} buffer - The metadata protobuf bytes
 * @returns {Object} The decoded metadata
 */
const decodeMetadata = (buffer) => {
  const metadata = {};
  let offset = 0;

  while (offset < buffer.length) {
    const { value: tag, length: tagLength } = decodeVarint(buffer, offset);
    offset += tagLength;

    const wireType = tag & 0b111;
    const fieldNumber = tag >> 3;

    switch (fieldNumber) {
      case METADATA_FIELDS.CREATED_AT: {
        // int64
        const { value, length } = decodeVarint(buffer, offset);
        metadata.created_at = value;
        offset += length;
        break;
      }
      case METADATA_FIELDS.IS_NEW: {
        // bool
        const { value, length } = decodeVarint(buffer, offset);
        metadata.is_new = value !== 0;
        offset += length;
        break;
      }
      case METADATA_FIELDS.DEVICE_TYPE: {
        // int32
        const { value, length } = decodeVarint(buffer, offset);
        metadata.device_type = value;
        offset += length;
        break;
      }
      case METADATA_FIELDS.REGION: {
        // string
        if (wireType === WIRE_TYPES.LEN) {
          const { value: strLength, length: lenLength } = decodeVarint(buffer, offset);
          offset += lenLength;
          metadata.region = utf8BytesToString(
            buffer.slice(offset, offset + strLength),
          );
          offset += strLength;
        }
        break;
      }
      case METADATA_FIELDS.SOURCE: {
        // int32
        const { value, length } = decodeVarint(buffer, offset);
        metadata.source = value;
        offset += length;
        break;
      }
      default: {
        // Skip unknown fields
        switch (wireType) {
          case WIRE_TYPES.VARINT:
            offset += decodeVarint(buffer, offset).length;
            break;
          case WIRE_TYPES.I64:
            offset += 8;
            break;
          case WIRE_TYPES.LEN: {
            const { value: fieldLength, length: lenLength } = decodeVarint(buffer, offset);
            offset += lenLength + fieldLength;
            break;
          }
          case WIRE_TYPES.I32:
            offset += 4;
            break;
          default:
            throw new Error(`Unknown wire type in metadata: ${wireType}`);
        }
      }
    }
  }

  return metadata;
};

/**
 * Decodes a full identity cookie including ECID, metadata, and write time.
 * @param {Uint8Array} buffer - The protobuf bytes
 * @returns {Object} Object with ecid, metadata, and write_time
 */
const decodeFullIdentityProtobuf = (buffer) => {
  const result = {
    ecid: null,
    metadata: null,
    write_time: null,
  };

  let offset = 0;

  while (offset < buffer.length) {
    const { value: tag, length: tagLength } = decodeVarint(buffer, offset);
    offset += tagLength;

    const wireType = tag & 0b111;
    const fieldNumber = tag >> 3;

    switch (fieldNumber) {
      case ECID_FIELD_NUMBER: {
        // ECID (string)
        if (wireType === WIRE_TYPES.LEN) {
          const { value: fieldLength, length: lenLength } = decodeVarint(buffer, offset);
          offset += lenLength;
          result.ecid = utf8BytesToString(
            buffer.slice(offset, offset + fieldLength),
          );
          offset += fieldLength;
        }
        break;
      }
      case METADATA_FIELD_NUMBER: {
        // Metadata (message)
        if (wireType === WIRE_TYPES.LEN) {
          const { value: fieldLength, length: lenLength } = decodeVarint(buffer, offset);
          offset += lenLength;
          result.metadata = decodeMetadata(
            buffer.slice(offset, offset + fieldLength),
          );
          offset += fieldLength;
        }
        break;
      }
      case WRITE_TIME_FIELD_NUMBER: {
        // Write time (int64)
        const { value, length } = decodeVarint(buffer, offset);
        result.write_time = value;
        offset += length;
        break;
      }
      default: {
        // Skip unknown fields
        switch (wireType) {
          case WIRE_TYPES.VARINT:
            offset += decodeVarint(buffer, offset).length;
            break;
          case WIRE_TYPES.I64:
            offset += 8;
            break;
          case WIRE_TYPES.LEN: {
            const { value: fieldLength, length: lenLength } = decodeVarint(buffer, offset);
            offset += lenLength + fieldLength;
            break;
          }
          case WIRE_TYPES.I32:
            offset += 4;
            break;
          default:
            throw new Error(`Unknown wire type: ${wireType}`);
        }
      }
    }
  }

  if (!result.ecid) {
    throw new Error("No ECID found in cookie.");
  }

  return result;
};

/**
 * Extracts ECID from a base64-encoded identity cookie value.
 * @param {string} cookieValue - The base64-encoded identity cookie value
 * @returns {string|null} The ECID, or null if decoding fails
 */
export const extractEcidFromIdentityCookie = (cookieValue) => {
  try {
    // Decode URL-safe base64 and parse protobuf
    const decodedCookie = decodeURIComponent(cookieValue)
      .replace(/_/g, "/")
      .replace(/-/g, "+");

    const cookieBytes = base64ToBytes(decodedCookie);
    return decodeKndctrProtobuf(cookieBytes);
  } catch (error) {
    // If decoding fails, return null (cookie might be malformed)
    return null;
  }
};

/**
 * Finds and extracts ECID from identity cookie in request meta state entries.
 * @param {string} orgId - The organization ID
 * @param {Array} stateEntries - The meta.state.entries array from the request
 * @returns {string|null} The ECID, or null if not found or invalid
 */
export const getEcidFromStateEntries = (orgId, stateEntries) => {
  if (!stateEntries || !Array.isArray(stateEntries)) {
    return null;
  }

  // Build the identity cookie name
  const identityCookieName = getIdentityCookieName(orgId);

  // Find the identity cookie entry
  const identityEntry = stateEntries.find(
    (entry) => entry.key === identityCookieName,
  );

  if (!identityEntry || !identityEntry.value) {
    return null;
  }

  // Extract and return the ECID
  return extractEcidFromIdentityCookie(identityEntry.value);
};

/**
 * Extracts full identity data (ECID, metadata, write_time) from a base64-encoded cookie.
 * @param {string} cookieValue - The base64-encoded identity cookie value
 * @returns {Object|null} Object with ecid, metadata, write_time, or null if decoding fails
 */
export const extractFullIdentityFromIdentityCookie = (cookieValue) => {
  try {
    // Decode URL-safe base64 and parse protobuf
    const decodedCookie = decodeURIComponent(cookieValue)
      .replace(/_/g, "/")
      .replace(/-/g, "+");

    const cookieBytes = base64ToBytes(decodedCookie);
    return decodeFullIdentityProtobuf(cookieBytes);
  } catch (error) {
    // If decoding fails, return null (cookie might be malformed)
    console.error("Failed to decode identity cookie:", error);
    return null;
  }
};


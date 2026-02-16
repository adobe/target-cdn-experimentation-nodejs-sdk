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

/**
 * Protobuf encoding utilities for creating identity cookies.
 * Based on the protobuf wire format: https://protobuf.dev/programming-guides/encoding/
 */

/**
 * Wire types used in protobuf encoding
 * | ID | Name   | Used for                                                 |
 * |----|--------|----------------------------------------------------------|
 * | 0  | varint | int32, int64, uint32, uint64, sint32, sint64, bool, enum |
 * | 2  | LEN    | string, bytes                                            |
 */
const WIRE_TYPES = {
  VARINT: 0,
  LEN: 2,
};

/**
 * Encodes a number as a varint (variable-length integer).
 * Uses BigInt to handle 64-bit integers correctly.
 * Variable-width integers use anywhere between one and ten bytes,
 * with small values using fewer bytes.
 *
 * Each byte in the varint has a continuation bit that indicates if the byte
 * that follows it is part of the varint. This is the most significant bit (MSB).
 * The lower 7 bits are a payload.
 *
 * @param {number} value - The number to encode
 * @returns {number[]} Array of bytes representing the varint
 */
export const encodeVarint = (value) => {
  const bytes = [];
  let num = BigInt(value); // Convert to BigInt to handle 64-bit integers

  while (num >= 0x80n) {
    // Set the continuation bit (MSB) and add the lower 7 bits
    bytes.push(Number(num & 0x7fn) | 0x80);
    num >>= 7n; // BigInt right shift
  }
  // Add the final byte (no continuation bit)
  bytes.push(Number(num & 0x7fn));

  return bytes;
};

/**
 * Creates a field tag by combining field number and wire type.
 * Tag = (field_number << 3) | wire_type
 *
 * @param {number} fieldNumber - The field number from the protobuf schema
 * @param {number} wireType - The wire type (VARINT or LEN)
 * @returns {number[]} The encoded tag as varint bytes
 */
const encodeTag = (fieldNumber, wireType) => {
  const tag = (fieldNumber << 3) | wireType;
  return encodeVarint(tag);
};

/**
 * Converts a string to UTF-8 bytes (EdgeWorker-compatible).
 * @param {string} str - The string to encode
 * @returns {number[]} Array of UTF-8 bytes
 */
const stringToUtf8Bytes = (str) => {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    
    if (charCode < 0x80) {
      // 1-byte character (0xxxxxxx)
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      // 2-byte character (110xxxxx 10xxxxxx)
      bytes.push(0xc0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      // 3-byte character (1110xxxx 10xxxxxx 10xxxxxx)
      bytes.push(0xe0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    } else {
      // 4-byte character (surrogate pair)
      i++;
      const nextCharCode = str.charCodeAt(i);
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (nextCharCode & 0x3ff));
      bytes.push(0xf0 | (charCode >> 18));
      bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    }
  }
  return bytes;
};

/**
 * Encodes a string field.
 * Format: tag + length + UTF-8 bytes
 *
 * @param {number} fieldNumber - The field number
 * @param {string} value - The string value to encode
 * @returns {number[]} Array of bytes
 */
export const encodeString = (fieldNumber, value) => {
  if (!value) return [];

  const bytes = [];
  const tag = encodeTag(fieldNumber, WIRE_TYPES.LEN);
  bytes.push(...tag);

  // Convert string to UTF-8 bytes (EdgeWorker-compatible)
  const utf8Bytes = stringToUtf8Bytes(value);

  // Add length and bytes
  const length = encodeVarint(utf8Bytes.length);
  bytes.push(...length);
  bytes.push(...utf8Bytes);

  return bytes;
};

/**
 * Encodes an int64 field.
 * Format: tag + varint value
 *
 * @param {number} fieldNumber - The field number
 * @param {number} value - The integer value to encode
 * @returns {number[]} Array of bytes
 */
export const encodeInt64 = (fieldNumber, value) => {
  if (value === undefined || value === null) return [];

  const bytes = [];
  const tag = encodeTag(fieldNumber, WIRE_TYPES.VARINT);
  bytes.push(...tag);

  const valueBytes = encodeVarint(value);
  bytes.push(...valueBytes);

  return bytes;
};

/**
 * Encodes an int32 field.
 * Format: tag + varint value
 *
 * @param {number} fieldNumber - The field number
 * @param {number} value - The integer value to encode
 * @returns {number[]} Array of bytes
 */
export const encodeInt32 = (fieldNumber, value) => {
  if (value === undefined || value === null) return [];

  const bytes = [];
  const tag = encodeTag(fieldNumber, WIRE_TYPES.VARINT);
  bytes.push(...tag);

  const valueBytes = encodeVarint(value);
  bytes.push(...valueBytes);

  return bytes;
};

/**
 * Encodes a boolean field.
 * Format: tag + varint (0 or 1)
 *
 * @param {number} fieldNumber - The field number
 * @param {boolean} value - The boolean value to encode
 * @returns {number[]} Array of bytes
 */
export const encodeBool = (fieldNumber, value) => {
  if (value === undefined || value === null) return [];

  const bytes = [];
  const tag = encodeTag(fieldNumber, WIRE_TYPES.VARINT);
  bytes.push(...tag);

  bytes.push(value ? 1 : 0);

  return bytes;
};

/**
 * Encodes a nested message field.
 * Format: tag + length + message bytes
 *
 * @param {number} fieldNumber - The field number
 * @param {number[]} messageBytes - The encoded message bytes
 * @returns {number[]} Array of bytes
 */
export const encodeMessage = (fieldNumber, messageBytes) => {
  if (!messageBytes || messageBytes.length === 0) return [];

  const bytes = [];
  const tag = encodeTag(fieldNumber, WIRE_TYPES.LEN);
  bytes.push(...tag);

  const length = encodeVarint(messageBytes.length);
  bytes.push(...length);
  bytes.push(...messageBytes);

  return bytes;
};


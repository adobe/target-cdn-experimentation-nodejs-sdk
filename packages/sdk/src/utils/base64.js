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

/**
 * Base64 encoding/decoding implementation that works in any JavaScript environment
 * including Akamai EdgeWorkers (no btoa/atob/Buffer required)
 */

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Converts a byte array to a base64 string.
 * Pure JavaScript implementation - works in EdgeWorkers, Node.js, and browsers.
 * Uses URL-safe base64 encoding (RFC 4648 §5) without padding.
 *
 * @param {number[] | Uint8Array} bytes - The bytes to encode
 * @returns {string} URL-safe base64 encoded string
 */
export const bytesToBase64 = (bytes) => {
  // Convert to Uint8Array if needed
  const uint8Array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  
  let result = "";
  let i = 0;
  
  // Process 3 bytes at a time
  while (i < uint8Array.length) {
    const byte1 = uint8Array[i++];
    const byte2 = i < uint8Array.length ? uint8Array[i++] : 0;
    const byte3 = i < uint8Array.length ? uint8Array[i++] : 0;
    
    // Convert 3 bytes (24 bits) into 4 base64 characters (6 bits each)
    const bits = (byte1 << 16) | (byte2 << 8) | byte3;
    
    result += BASE64_CHARS.charAt((bits >> 18) & 0x3f);
    result += BASE64_CHARS.charAt((bits >> 12) & 0x3f);
    result += BASE64_CHARS.charAt((bits >> 6) & 0x3f);
    result += BASE64_CHARS.charAt(bits & 0x3f);
  }
  
  // Handle padding for standard base64
  const paddingLength = (3 - (uint8Array.length % 3)) % 3;
  if (paddingLength > 0) {
    // Remove the extra characters that were added for padding
    result = result.slice(0, -paddingLength);
    // Note: We'll remove padding entirely for URL-safe base64 below
  }
  
  // Convert to URL-safe base64 (replace + with -, / with _, remove padding =)
  return result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

/**
 * Converts a base64 string to a byte array.
 * Pure JavaScript implementation - works in EdgeWorkers, Node.js, and browsers.
 * Handles URL-safe base64 encoding.
 *
 * @param {string} base64String - The base64 string to decode
 * @returns {Uint8Array} The decoded bytes
 */
export const base64ToBytes = (base64String) => {
  // Convert URL-safe base64 to regular base64
  let base64 = base64String.replace(/-/g, "+").replace(/_/g, "/");
  
  // Add padding if needed
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(padding);
  
  // Create lookup table for base64 characters
  const lookup = {};
  for (let i = 0; i < BASE64_CHARS.length; i++) {
    lookup[BASE64_CHARS.charAt(i)] = i;
  }
  
  const bytes = [];
  let i = 0;
  
  // Process 4 base64 characters at a time
  while (i < base64.length) {
    const char1 = base64.charAt(i++);
    const char2 = base64.charAt(i++);
    const char3 = base64.charAt(i++);
    const char4 = base64.charAt(i++);
    
    // Skip padding characters
    if (char1 === "=" || char2 === "=") break;
    
    const bits1 = lookup[char1] || 0;
    const bits2 = lookup[char2] || 0;
    const bits3 = char3 !== "=" ? (lookup[char3] || 0) : 0;
    const bits4 = char4 !== "=" ? (lookup[char4] || 0) : 0;
    
    // Convert 4 base64 characters (24 bits) into 3 bytes
    const byte1 = (bits1 << 2) | (bits2 >> 4);
    bytes.push(byte1);
    
    if (char3 !== "=") {
      const byte2 = ((bits2 & 0x0f) << 4) | (bits3 >> 2);
      bytes.push(byte2);
    }
    
    if (char4 !== "=") {
      const byte3 = ((bits3 & 0x03) << 6) | bits4;
      bytes.push(byte3);
    }
  }
  
  return new Uint8Array(bytes);
};


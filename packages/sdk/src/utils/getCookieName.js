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

const COOKIE_NAME_PREFIX = "kndctr";

/**
 * Sanitizes the organization ID for use in cookie names.
 * Replaces @ with _ to create a valid cookie name.
 *
 * @param {string} orgId - The organization ID (e.g., "ABC123@AdobeOrg")
 * @returns {string} Sanitized org ID (e.g., "ABC123_AdobeOrg")
 */
const sanitizeOrgId = (orgId) => {
  return orgId.replace("@", "_");
};

/**
 * Gets the namespaced cookie name for a given organization and key.
 * Format: kndctr_<SANITIZED_ORGID>_<KEY>
 *
 * @param {string} orgId - The organization ID
 * @param {string} key - The cookie key (e.g., "identity", "cluster")
 * @returns {string} The full cookie name
 */
export const getCookieName = (orgId, key) => {
  return `${COOKIE_NAME_PREFIX}_${sanitizeOrgId(orgId)}_${key}`;
};

/**
 * Gets the identity cookie name for a given organization.
 * Format: kndctr_<SANITIZED_ORGID>_identity
 *
 * @param {string} orgId - The organization ID
 * @returns {string} The identity cookie name
 */
export const getIdentityCookieName = (orgId) => {
  return getCookieName(orgId, "identity");
};

/**
 * Gets the cluster cookie name for a given organization.
 * Format: kndctr_<SANITIZED_ORGID>_cluster
 *
 * @param {string} orgId - The organization ID
 * @returns {string} The cluster cookie name
 */
export const getClusterCookieName = (orgId) => {
  return getCookieName(orgId, "cluster");
};


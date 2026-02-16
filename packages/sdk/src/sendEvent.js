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

import { flatten } from "./utils/flatten.js";
import { Container, TOKENS } from "./container.js";
import { generateECID, generateEcidFromFpid } from "./utils/generateECID.js";
import { uuid } from "./utils/uuid/index.js";
import { MESSAGES } from "./messages.js";
import { RuleEngine } from "./ruleEngine.js";
import { createUrlContext, createTimingContext } from "./contextProvider.js";
import { getAepEdgeClusterCookie } from "./utils/cookie.js";
import { createIdentityCookieValue } from "./utils/encodeIdentityCookie.js";
import {
  getIdentityCookieName,
  getClusterCookieName,
} from "./utils/getCookieName.js";
import { getEcidFromStateEntries } from "./utils/decodeIdentityCookie.js";

const getRequestIdentity = (namespaceCode) => {
  return (event) => {
    const namespace =
      event.xdm &&
      event.xdm.identityMap &&
      event.xdm.identityMap[namespaceCode];
    if (
      namespace === undefined ||
      namespace === null ||
      (namespace && namespace.length === 0)
    ) {
      return null;
    }
    return namespace;
  };
};
const getRequestEcidIdentity = getRequestIdentity("ECID");
const getRequestFpidIdentity = getRequestIdentity("FPID");

const createResponseIdentityPayload = (event) => {
  const payloads = Object.keys(event.xdm.identityMap).flatMap((namespace) => {
    return event.xdm.identityMap[namespace].map((identity) => {
      const result = {
        id: identity.id,
        namespace: {
          code: namespace,
        },
      };
      if (identity.authenticatedState) {
        result.authenticatedState = identity.authenticatedState;
      }
      if (identity.primary) {
        result.primary = identity.primary;
      }
      if (identity.xid) {
        result.xid = identity.xid;
      }
      return result;
    });
  });

  return {
    payload: payloads,
    type: "identity:result",
  };
};

const addContext = (event) => {
  const webPageDetails = event?.xdm?.web?.webPageDetails;
  const timingContext = createTimingContext();
  const pageContext = createUrlContext(webPageDetails?.URL);
  const referringContext = createUrlContext(webPageDetails?.referrer);
  event.xdm.timestamp = event.xdm.timestamp || timingContext.current_timestamp;

  event.tgt = {
    page: pageContext,
    referring: referringContext,
    ...timingContext,
  };

  return event;
};

export const sendEvent = async (clientOptions, requestBody) => {
  const logAdapterInstance = Container().getInstance(TOKENS.LOGGER);
  const { orgId, locationHintId, locationHint, stateStore } = clientOptions;
  const requestEcid = getRequestEcidIdentity(requestBody);
  const requestFpid = getRequestFpidIdentity(requestBody);

  console.log("requestEcid", requestEcid);
  let ecid = requestEcid || [{ id: "" }];
  let ecidSource = null; // Track how ECID was obtained

  if (!requestEcid) {
    // Identity cookie is ONLY checked when identityMap has no ECID (matching Konductor logic)
    const ecidFromCookie = getEcidFromStateEntries(
      orgId,
      requestBody?.meta?.state?.entries,
    );

    if (ecidFromCookie) {
      // Use ECID from identity cookie
      ecid[0].id = ecidFromCookie;
      ecidSource = "RECEIVED_IN_REQUEST"; // From existing identity
    } else if (requestFpid) {
      // Generate from FPID
      ecid[0].id = generateEcidFromFpid(orgId, requestFpid[0].id);
      ecidSource = "FIRST_PARTY_ID";
    } else {
      // Generate new random ECID
      ecid[0].id = generateECID();
      ecidSource = "RANDOM";
    }
  } else {
    // ECID was provided in identityMap
    ecidSource = "RECEIVED_IN_REQUEST";
  }

  const event = addContext({
    ...requestBody,
    xdm: {
      ...requestBody?.xdm,
      identityMap: {
        ...requestBody?.xdm?.identityMap,
        ECID: ecid,
      },
    },
  });

  const context = {
    ...event,
    ...flatten(event),
  };
  let rulesConsequences = [];
  try {
    const decisionScopes = requestBody?.decisionScopes ||
      requestBody?.personalization?.decisionScopes ||
      requestBody?.query?.personalization?.decisionScopes || ["__view__"];
    const rulesByDecisionScope = clientOptions.rules.rules
      .map((rule) => {
        const consequencesForDecisionScope = rule.consequences.filter(
          (consequences) => decisionScopes.includes(consequences.detail.scope),
        );
        return { ...rule, consequences: consequencesForDecisionScope };
      })
      .filter((rule) => rule.consequences.length > 0);
    const rulesEngine = { ...clientOptions.rules, rules: rulesByDecisionScope };
    const rulesEngineWithDecisionScope = RuleEngine({ rules: rulesEngine });
    rulesConsequences = rulesEngineWithDecisionScope.execute(context);
  } catch (e) {
    logAdapterInstance.log(
      MESSAGES.SEND_EVENT.RULES_ENGINE_FAILED_EXECUTION,
      e,
    );
    return [];
  }

  const decisions = {
    eventIndex: 0,
    type: "personalization:decisions",
    payload: rulesConsequences.flat(1).map((consequence) => consequence.detail),
  };

  const handle = [createResponseIdentityPayload(event), decisions];
  const edgeClusterId = getAepEdgeClusterCookie(
    orgId,
    requestBody?.meta?.state?.entries,
  );

  if (edgeClusterId && edgeClusterId !== locationHintId) {
    handle.push({
      payload: [
        {
          scope: "EdgeNetwork",
          hint: edgeClusterId,
          ttlSeconds: 1800,
        },
      ],
      type: "locationHint:result",
    });
  } else if (locationHint) {
    handle.push(locationHint);
  }

  // Build state:store payload following Konductor's logic
  const identityCookieName = getIdentityCookieName(orgId);
  const clusterCookieName = getClusterCookieName(orgId);
  const ecidValue = event.xdm.identityMap.ECID[0].id;

  // Find existing cookies in request
  const existingIdentityCookie = requestBody?.meta?.state?.entries?.find(
    (entry) => entry.key === identityCookieName,
  );
  const existingClusterCookie = requestBody?.meta?.state?.entries?.find(
    (entry) => entry.key === clusterCookieName,
  );

  // Extract ECID from existing identity cookie if present
  const ecidFromExistingIdentity = existingIdentityCookie
    ? getEcidFromStateEntries(orgId, [existingIdentityCookie])
    : null;

  const stateStorePayload = [];

  // 1. Identity Cookie Logic (matching Konductor's writeRequired + write methods)
  if (existingIdentityCookie && ecidFromExistingIdentity === ecidValue) {
    // ECID matches existing identity cookie - preserve it exactly to maintain metadata
    // This matches Konductor's logic: stored.copy(ecid = value, writeTime = Instant.now())
    stateStorePayload.push(existingIdentityCookie);
  } else {
    // Either no identity cookie exists, or ECID has changed - generate new identity cookie
    // This matches Konductor's logic for creating new StoredIdentity with fresh metadata
    const regionValue = locationHintId || existingClusterCookie?.value || "";
    //Identity cookie format is base64-encoded protobuf 
    //identity cookie will will contain ecid, metadata, and writeTime
    const identityCookieValue = createIdentityCookieValue(ecidValue, {
      isNew: ecidSource === "RANDOM", // Only true for newly generated ECIDs
      region: regionValue.toUpperCase(), // Region must be uppercase to match Konductor (e.g., "IRL1" not "irl1")
      source: ecidSource, // Track how ECID was obtained
    });

    stateStorePayload.push({
      key: identityCookieName,
      value: identityCookieValue,
      maxAge: 34128000, // ~395 days in seconds
    });
  }

  // 2. Cluster Cookie Logic
  // Cluster should come from: existing cluster cookie > locationHintId > edgeClusterId
  const clusterValue =
    existingClusterCookie?.value || locationHintId || edgeClusterId;

  if (clusterValue) {
    stateStorePayload.push({
      key: clusterCookieName,
      value: clusterValue,
      maxAge: 1800, // 30 minutes in seconds
    });
  }

  // 3. Merge other stateStore entries (excluding identity & cluster which we've already handled)
  // This is for any additional cookies from locationHintRequester
  if (stateStore?.payload) {
    stateStore.payload.forEach((entry) => {
      if (
        entry.key !== identityCookieName &&
        entry.key !== clusterCookieName
      ) {
        stateStorePayload.push(entry);
      }
    });
  }

  // Add state:store handle
  handle.push({
    type: "state:store",
    payload: stateStorePayload,
  });

  return {
    requestId: uuid(),
    handle,
  };
};

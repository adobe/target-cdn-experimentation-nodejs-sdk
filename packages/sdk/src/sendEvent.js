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

/**
 * The SendEvent method that returns a decision
 * @param {import("../types/index.js").ClientOptions} clientOptions
 * @returns {import("../types/index.js").SendEvent}
 */
export const sendEvent = async (clientOptions, requestBody) => {
  const logAdapterInstance = Container().getInstance(TOKENS.LOGGER);
  const { rulesEngine, orgId } = { ...clientOptions };
  const requestEcid = getRequestEcidIdentity(requestBody);

  let ecid = requestEcid || [{ id: "" }];

  if (!requestEcid) {
    const requestFpid = getRequestFpidIdentity(requestBody);
    ecid[0].id = requestFpid
      ? generateEcidFromFpid(orgId, requestFpid[0].id)
      : generateECID();
  }

  const event = {
    ...requestBody,
    xdm: {
      ...requestBody?.xdm,
      identityMap: {
        ...requestBody?.xdm?.identityMap,
        ECID: ecid,
      },
    },
  };

  const context = {
    ...event,
    ...flatten(event),
  };
  let rulesConsequences = [];
  try {
    rulesConsequences = rulesEngine.execute(context);
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

  return {
    requestId: uuid(),
    handle: [createResponseIdentityPayload(event), decisions],
  };
};

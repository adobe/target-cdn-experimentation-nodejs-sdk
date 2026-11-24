/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const AEP_COOKIE_PREFIX = "kndctr";

export const getCookie = (cookieHeader, name) => {
  for (const part of String(cookieHeader || "").split(";")) {
    const eq = part.indexOf("=");
    if (eq !== -1 && part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return undefined;
};

export const cookieNames = (orgId) => {
  const prefix = `${AEP_COOKIE_PREFIX}_${orgId.replace("@", "_")}`;
  return { identity: `${prefix}_identity`, cluster: `${prefix}_cluster` };
};

// The identity cookie is protobuf encoded: pass it through untouched, the SDK decodes it.
export const buildStateEntries = (cookieHeader, orgId) => {
  const names = cookieNames(orgId);
  return [names.identity, names.cluster]
    .map((key) => ({ key, value: getCookie(cookieHeader, key) }))
    .filter((entry) => entry.value);
};

export const createClientEvent = (request, config) => {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get("Cookie");
  const entries = buildStateEntries(cookieHeader, config.orgId);

  return {
    type: "decisioning.propositionFetch",
    personalization: {
      sendDisplayEvent: false, // the browser (Alloy) reports the display so Analytics (A4T) stays stitched
      decisionScopes: config.decisionScopes,
    },
    xdm: {
      web: {
        webPageDetails: { URL: url.href },
        webReferrer: { URL: request.headers.get("Referer") || "" },
      },
      implementationDetails: { name: "server-side", environment: "server" },
    },
    query: {
      personalization: { decisionScopes: config.decisionScopes },
    },
    meta: {
      state: { domain: url.hostname, cookiesEnabled: true, entries },
    },
  };
};

// Turns the state:store handle into Set-Cookie headers (identity + cluster cookies).
export const buildSetCookies = (sdkResponse, domain) => {
  const stateStore = sdkResponse?.handle?.find(
    (handle) => handle.type === "state:store",
  );
  return (stateStore?.payload || []).map((entry) => {
    const domainAttr = domain ? `; Domain=${domain}` : "";
    return `${entry.key}=${entry.value}; Max-Age=${entry.maxAge}; Path=/; Secure; SameSite=Lax${domainAttr}`;
  });
};

export const getDecisions = (sdkResponse) =>
  sdkResponse?.handle?.find(
    (handle) => handle.type === "personalization:decisions",
  )?.payload || [];

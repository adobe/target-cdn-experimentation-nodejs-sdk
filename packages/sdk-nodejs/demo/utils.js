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

const ECID_COOKIE_NAME = "ECID";
const AEP_COOKIE_PREFIX = "kndctr";

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split("=");
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
};

const getAEPCookies = (cookies) => {
  const entries = [];

  Object.keys(cookies)
    .filter((key) => key.startsWith(AEP_COOKIE_PREFIX))
    .forEach((key) => {
      entries.push({
        key,
        value: cookies[key],
      });
    });

  return entries;
};

const createClientRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const ecid = cookies[ECID_COOKIE_NAME] || "";
  const aepCookies = getAEPCookies(cookies);

  const identityMap = ecid
    ? {
        ECID: [
          {
            id: ecid,
          },
        ],
      }
    : undefined;

  return {
    type: "decisioning.propositionFetch",
    decisionScopes: ["__view__"],
    personalization: {
      sendDisplayEvent: true,
    },
    xdm: {
      web: {
        webPageDetails: {
          URL: `${req.protocol || "http"}://${req.headers.host}${req.url}`,
        },
        webReferrer: { URL: "" },
      },
      ...(identityMap ? { identityMap } : {}),
      implementationDetails: {
        name: "server-side",
        version: "0.0.5",
        environment: "server",
      },
      timestamp: new Date().toISOString(),
    },
    query: {
      identity: {
        fetch: ["ECID"],
      },
      personalization: {
        schemas: [
          "https://ns.adobe.com/personalization/default-content-item",
          "https://ns.adobe.com/personalization/html-content-item",
          "https://ns.adobe.com/personalization/json-content-item",
          "https://ns.adobe.com/personalization/redirect-item",
          "https://ns.adobe.com/personalization/dom-action",
        ],
        decisionScopes: ["__view__"],
      },
    },
    meta: {
      state: {
        domain: req.headers.host,
        cookiesEnabled: true,
        entries: aepCookies,
      },
    },
  };
};

const getPersistedValues = (response) => {
  const ecidHandle = response?.handle?.find(
    (payload) =>
      payload.type === "identity:result" &&
      payload.payload[0].namespace.code === "ECID",
  );
  const ecid = ecidHandle?.payload[0]?.id || "";

  const locationHintIdHandle = response?.handle?.find(
    (payload) =>
      payload.type === "locationHint:result" &&
      payload?.payload.find((scope) => scope.scope === "EdgeNetwork")?.hint,
  );
  const locationHintId =
    locationHintIdHandle?.payload.find((scope) => scope.scope === "EdgeNetwork")
      ?.hint || "";

  return { ecid, locationHintId };
};

export { createClientRequest, getPersistedValues };

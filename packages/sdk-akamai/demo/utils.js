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
import { Cookies } from "cookies";

const ECID_COOKIE_NAME = "ECID";
const AEP_COOKIE_PREFIX = "kndctr";

const createClientRequest = (req, config) => {
  const cookies = new Cookies(req.getHeader("Cookie"));
  const ecid = cookies.get(ECID_COOKIE_NAME);
  const clusterCookieName = `${AEP_COOKIE_PREFIX}_${config.orgId.replace("@", "_")}_cluster`;
  const clusterCookieValue = cookies.get(clusterCookieName);
  const metaEntries = clusterCookieValue
    ? [
        {
          key: clusterCookieName,
          value: clusterCookieValue,
        },
      ]
    : [];

  const identityMap = ecid
    ? {
        ECID: [
          {
            id: ecid,
            authenticatedState: "ambiguous",
            primary: true,
          },
        ],
      }
    : undefined;

  return {
    type: "decisioning.propositionFetch",
    decisionScopes: [
      "cdn-sdk-mbox-test",
      "ss-control-test",
      "previewDemo",
      "mboxtestmay",
    ],
    personalization: {
      sendDisplayEvent: true,
    },
    xdm: {
      web: {
        webPageDetails: { URL: `${req.scheme}://${req.host}${req.url}` },
        webReferrer: { URL: "" },
      },
      identityMap: {
        ...identityMap,
      },
      implementationDetails: {
        name: "server-side",
        version: "0.0.5",
        environment: "server",
      },
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
        decisionScopes: [
          "cdn-sdk-mbox-test",
          "ss-control-test",
          "previewDemo",
          "mboxtestmay",
        ],
      },
    },
    data: {
      __adobe: {
        target: {
          myAnimal: "dog",
        },
      },
    },
    meta: {
      state: {
        domain: req.host,
        cookiesEnabled: true,
        entries: metaEntries,
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

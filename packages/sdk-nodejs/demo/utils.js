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
        webPageDetails: {
          URL: `${req.protocol}://${req.headers.host}${req.url}`,
        },
        webReferrer: { URL: "" },
      },
      identityMap: {
        ...identityMap,
      },
      implementationDetails: {
        name: "server-side",
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
      payload?.payload[0]?.scope === "EdgeNetwork",
  );
  const locationHintId = locationHintIdHandle?.payload[0]?.hint || "";

  return { ecid, locationHintId };
};

export { createClientRequest, getPersistedValues };

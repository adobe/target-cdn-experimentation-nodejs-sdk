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

const createClientRequest = (req) => {
  const cookies = new Cookies(req.getHeader("Cookie"));
  const ecid = cookies.get(ECID_COOKIE_NAME);

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
    personalization: {
      sendDisplayEvent: false,
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

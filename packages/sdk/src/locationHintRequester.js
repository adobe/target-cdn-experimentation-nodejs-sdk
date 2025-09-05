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

import { edgeRequester } from "./edgeRequester.js";

export const locationHintRequester = async (clientOptions) => {
  const dummyRequest = {
    event: {
      type: "decisioning.propositionFetch",
      xdm: {
        web: {
          webPageDetails: {
            URL: "address",
          },
          webReferrer: {
            URL: "",
          },
        },
        implementationDetails: {
          name: "server-side",
        },
      },
    },
  };
  const response = await edgeRequester(clientOptions, "interact", dummyRequest);

  let stateStore = null;
  let locationHint = null;
  let locationHintId = null;

  if (response && response.handle && Array.isArray(response.handle)) {
    const stateStorePayload = response.handle.find(
      (payload) => payload && payload.type === "state:store",
    );

    if (stateStorePayload && stateStorePayload.payload) {
      stateStore = stateStorePayload;
      stateStore.payload = stateStorePayload.payload.filter((payload) =>
        payload.key.includes("_cluster"),
      );
    }

    const locationHintPayload = response.handle.find(
      (payload) => payload && payload.type === "locationHint:result",
    );

    if (locationHintPayload && locationHintPayload.payload) {
      locationHint = locationHintPayload;

      const edgeNetworkScope = locationHintPayload.payload.find(
        (scope) => scope && scope.scope === "EdgeNetwork",
      );

      if (edgeNetworkScope && edgeNetworkScope.hint) {
        locationHintId = edgeNetworkScope.hint;
      }
    }
  }

  return { locationHintId, stateStore, locationHint };
};

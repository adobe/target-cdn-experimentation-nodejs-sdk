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

const eventNotificationAdaptor = (requestBody, response) => {
  const decisions = response.handle?.find(
    (handle) => handle.type === "personalization:decisions",
  );
  const propositions =
    decisions?.payload.map((proposition) => {
      const { id, scope, scopeDetails } = proposition;

      return {
        id,
        scope,
        scopeDetails,
      };
    }) || [];

  const identity = response.handle?.find(
    (handle) => handle.type === "identity:result",
  );

  const identityMap = identity?.payload.reduce((acc, identity) => {
    const identityEntry = {
      id: identity.id,
    };
    if (acc[identity.namespace.code] && acc[identity.namespace.code].length) {
      acc[identity.namespace.code].push(identityEntry);
    } else {
      identityEntry.primary = true;
      acc[identity.namespace.code] = [identityEntry];
    }
    return acc;
  }, {});

  const displayEvent = {
    xdm: {
      ...requestBody.xdm,
      identityMap: identityMap,
      eventType: "decisioning.propositionDisplay",
      timestamp: new Date().toISOString(),
      _experience: {
        decisioning: {
          propositions: propositions,
          propositionEventType: {
            display: 1,
          },
        },
      },
    },
  };

  return displayEvent;
};

export { eventNotificationAdaptor };

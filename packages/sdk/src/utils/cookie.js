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
const COOKIE_NAME_AEP_EDGE_CLUSTER = "cluster";

export const getAepCookieName = (organizationId, name) => {
  return [AEP_COOKIE_PREFIX, organizationId.replace("@", "_"), name].join("_");
};

export const getAepEdgeClusterCookie = (organizationId, entries) => {
  const cookieName = getAepCookieName(
    organizationId,
    COOKIE_NAME_AEP_EDGE_CLUSTER,
  );

  return entries?.find((entry) => entry.key === cookieName)?.value;
};

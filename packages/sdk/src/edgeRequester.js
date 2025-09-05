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

import { uuid } from "./utils/uuid/index.js";
import { Container, TOKENS } from "./container.js";
import { getAepEdgeClusterCookie } from "./utils/cookie.js";

const AEP_EDGE_DOMAIN = "edge.adobedc.net";
const EXP_EDGE_BASE_PATH_PROD = "ee";
const DEFAULT_REQUEST_HEADERS = {
  accept: "*/*",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "text/plain; charset=UTF-8",
  pragma: "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "sec-gpc": "1",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const getDomain = (edgeDomain) => {
  if (undefined === edgeDomain || "" !== edgeDomain)
    return `https://${edgeDomain || AEP_EDGE_DOMAIN}`;
  return " ";
};

const edgeRequester = async (clientOptions, endpoint, requestBody) => {
  const httpRequestAdapterInstance = Container().getInstance(
    TOKENS.HTTP_CLIENT,
  );

  const requestId = uuid();
  const { edgeDomain, edgeBasePath, datastreamId, locationHintId, orgId } =
    clientOptions;

  const event =
    "interact" === endpoint ? requestBody.event : requestBody?.events?.[0];
  const edgeClusterId = getAepEdgeClusterCookie(
    orgId,
    event?.meta?.state?.entries,
  );

  const requestUrl = [
    getDomain(edgeDomain),
    edgeBasePath || EXP_EDGE_BASE_PATH_PROD,
    edgeClusterId || locationHintId || "",
    "v2",
    `${endpoint}?datastreamId=${datastreamId}&requestId=${requestId}`,
  ]
    .filter((elem) => elem.length > 0)
    .join("/")
    .trim();

  const headers = {
    ...DEFAULT_REQUEST_HEADERS,
  };
  
  clientOptions.debug[endpoint] = {
    requestUrl,
    requestBody,
  };

  return httpRequestAdapterInstance.makeRequest(requestUrl, {
    headers,
    body: JSON.stringify(requestBody),
    method: "POST",
  });
};

export { edgeRequester };

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

import { Container, TOKENS } from "./container.js";
import { MESSAGES } from "./messages.js";

const TARGET_EDGE_DOMAIN = "assets.adobetarget.com";
const RULE_BASE_PATH_PROD = "aep-odd-rules";
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

const getDomain = (ruleDomain) => {
  if (undefined === ruleDomain || "" !== ruleDomain)
    return `https://${ruleDomain || TARGET_EDGE_DOMAIN}`;
  return " ";
};

const ruleRequester = async (clientOptions) => {
  const { ruleDomain, orgId, propertyToken, ruleBasePath } = clientOptions;
  const httpRequestAdapterInstance = Container().getInstance(
    TOKENS.HTTP_CLIENT,
  );
  const requestUrl = [
    getDomain(ruleDomain),
    ruleBasePath || RULE_BASE_PATH_PROD,
    orgId,
    "production",
    "v1",
    propertyToken,
    "rules.json",
  ]
    .filter((elem) => elem && elem.length > 0)
    .join("/")
    .trim();

  const headers = {
    ...DEFAULT_REQUEST_HEADERS
  };

  try {
    return await httpRequestAdapterInstance.makeRequest(requestUrl, {
      headers,
    });
  } catch (e) {
    throw new Error(`${MESSAGES.RULES_ENGINE.FETCH_ERROR}, ${e}`);
  }
};

export { ruleRequester };

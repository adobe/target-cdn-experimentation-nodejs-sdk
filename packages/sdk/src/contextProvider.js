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

import { default as parseURI } from "parse-uri";

export const createUrlContext = (url) => {
  const parsed = parseURI(url) || {};

  const { host = "", path = "", query = "", anchor = "" } = parsed;

  const domainParts = host.split(".");
  let subdomain = "";
  let topLevelDomain = "";
  if (domainParts.length > 2) {
    subdomain = domainParts[0] === "www" ? "" : domainParts[0];
    topLevelDomain =
      domainParts.length === 4
        ? `${domainParts[2]}.${domainParts[3]}`
        : domainParts[2];
  }

  return {
    url,
    subdomain,
    domain: host,
    topLevelDomain,
    path,
    query,
    fragment: anchor,
  };
};

export const createTimingContext = () => {
  const now = new Date();

  const twoDigitString = (value) => (value < 10 ? `0${value}` : String(value));

  const currentHours = twoDigitString(now.getUTCHours());
  const currentMinutes = twoDigitString(now.getUTCMinutes());

  const currentTime = `${currentHours}${currentMinutes}`;
  const currentDay = now.getUTCDay(); // 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.

  return {
    current_timestamp: now.getTime(), // in ms
    current_time: currentTime, // 24-hour time, UTC, HHmm
    current_day: currentDay === 0 ? 7 : currentDay, // 1-7, 1 = monday, 7 = sunday
  };
};

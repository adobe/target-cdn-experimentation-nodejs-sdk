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

const DATASTREAM_ID = "";
const ORG_ID = "";
const ALLOY_SCRIPT_TAG = `
      !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
      []).push(o),n[o]=function(){var u=arguments;return new Promise(
      function(i,l){n.setTimeout(function(){n[o].q.push([i,l,u])})})},n[o].q=[])})}
      (window,["alloy"]);
    `;
const ALLOY_CONFIGURE_COMMAND = `
        alloy("configure", {
            datastreamId: "${DATASTREAM_ID}",
            orgId: "${ORG_ID}",
        });
`;

export { DATASTREAM_ID, ORG_ID, ALLOY_SCRIPT_TAG, ALLOY_CONFIGURE_COMMAND };

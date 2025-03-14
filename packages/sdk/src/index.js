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

import { sendEvent } from "./sendEvent.js";
import { remoteSendEvent } from "./remoteSendEvent.js";
import { sendNotification } from "./sendNotification.js";
import { RuleEngine } from "./ruleEngine.js";
import { ruleRequester } from "./ruleRequester.js";
import { MESSAGES } from "./messages.js";
import { Container, TOKENS } from "./container.js";
import { eventNotificationAdaptor } from "./utils/eventNotificationAdaptor.js";

/**
 * The Client initialization method
 * @param {import("../types/index.js").ClientOptions} clientOptions
 * @returns {Promise<import("../types/index.js").ClientResponse>}
 */
async function BaseClient(clientOptions) {
  const options = { ...clientOptions };
  const sendEventFunc = options.oddEnabled ? sendEvent : remoteSendEvent;

  if (options.oddEnabled) {
    if (!options.rules) {
      const rules = await ruleRequester(options);
      if (!rules) {
        throw new Error(MESSAGES.RULES_ENGINE.EMPTY_RULES_ERROR);
      }
      options.rules = rules;
    }

    if (options.rulesPoolingInterval) {
      const intervalInMilliseconds = options.rulesPoolingInterval * 1000;
      setInterval(async () => {
        const rules = await ruleRequester(options);
        if (!rules) {
          throw new Error(MESSAGES.RULES_ENGINE.EMPTY_RULES_ERROR);
        }
        options.rules = rules;
        options.rulesEngine = RuleEngine(options);
      }, intervalInMilliseconds);
    }

    options.rulesEngine = RuleEngine(options);
  }

  return {
    sendEvent: async (requestBody) => {
      const response = await sendEventFunc(options, requestBody);
      if (requestBody?.personalization?.sendDisplayEvent) {
        const displayEvent = eventNotificationAdaptor(requestBody, response);
        if (displayEvent) {
          sendNotification(options, displayEvent);
        }
      }
      return response;
    },
    sendNotification: async (requestBody) => {
      return sendNotification(options, requestBody);
    },
  };
}

export { BaseClient, Container, TOKENS };

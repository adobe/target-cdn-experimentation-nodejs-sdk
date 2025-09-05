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
import { locationHintRequester } from "./locationHintRequester.js";
import { incrementValue } from "./utils/debug.js";

/**
 * The Client initialization method
 * @param {import("../types/").ClientOptions} clientOptions
 * @returns {Promise<import("../types/").ClientResponse>}
 */
async function BaseClient(clientOptions) {
  const scheduler = Container().getInstance(TOKENS.SCHEDULER);
  const logAdapterInstance = Container().getInstance(TOKENS.LOGGER);

  const options = { ...clientOptions };
  options.debug = {
    startTimeClient: new Date().toISOString(),
    numberOfStartCalls: incrementValue(options.debug?.numberOfStartCalls ?? 0),
  };

  const sendEventFunc = options.oddEnabled ? sendEvent : remoteSendEvent;

  if (options.oddEnabled) {
    const { locationHintId, stateStore, locationHint } =
      await locationHintRequester(options);
    options.debug.locationHintRequesterCalls = incrementValue(
      options?.debug?.locationHintRequesterCalls ?? 0,
    );

    options.locationHintId = locationHintId;
    options.locationHint = locationHint;
    options.stateStore = stateStore;

    if (!options.rules) {
      const rules = await ruleRequester(options);
      options.debug.numberOfRulesCalls = incrementValue(
        options?.debug?.numberOfRulesCalls ?? 0,
      );
      if (!rules) {
        throw new Error(MESSAGES.RULES_ENGINE.EMPTY_RULES_ERROR);
      }
      options.rules = rules;
    }

    if (scheduler && options.rulesPoolingInterval) {
      const intervalInMilliseconds = options.rulesPoolingInterval * 1000;
      options.rulesPoolingIntervalId = scheduler.start(async () => {
        options.debug.numberOfRulesPoolingIntervalCalls = incrementValue(
          options?.debug?.numberOfRulesPoolingIntervalCalls ?? 0,
        );
        const rules = await ruleRequester(options);
        if (!rules) {
          scheduler.stop(options.rulesPoolingIntervalId);
          throw new Error(MESSAGES.RULES_ENGINE.EMPTY_RULES_ERROR);
        }
        options.rules = rules;
        options.rulesEngine = RuleEngine(options);
      }, intervalInMilliseconds);
    }

    options.rulesEngine = RuleEngine(options);
    options.stopRulesPoolingInterval = () => {
      if (scheduler && options.rulesPoolingIntervalId) {
        options.debug.numberOfStopRulesPoolingIntervalCalls = incrementValue(
          options.debug.numberOfStopRulesPoolingIntervalCalls ?? 0,
        );
        scheduler.stop(options.rulesPoolingIntervalId);
      }
    };
  }

  return {
    sendEvent: async (requestBody) => {
      if (scheduler) {
        options.debug.numberOfSchedulerCalls = incrementValue(
          options.debug.numberOfSchedulerCalls ?? 0,
        );
        scheduler.maybeRefresh();
      }
      options.debug.numberOfSendEventCalls = incrementValue(
        options.debug.numberOfSendEventCalls ?? 0,
      );

      const response = await sendEventFunc(options, requestBody);
      const numberOfPersonalizationDecisions = response.handle.find(
        (handle) => handle.type === "personalization:decisions",
      );
      if (
        requestBody?.personalization?.sendDisplayEvent &&
        numberOfPersonalizationDecisions?.payload?.length > 0
      ) {
        const displayEvent = eventNotificationAdaptor(requestBody, response);
        options.debug.numberOfAutomaticSendNotificationCalls = incrementValue(
          options.debug.numberOfAutomaticSendNotificationCalls ?? 0,
        );
        if (displayEvent) {
          sendNotification(options, displayEvent).catch((error) => {
            if (options?.debug?.logEdgeErrors) {
              logAdapterInstance.log(
                "edgeRequester error (sendNotification fire-and-forget)",
                {
                  message: error?.message,
                  status: error?.status,
                  statusText: error?.statusText,
                  url: error?.url,
                  body: error?.body,
                },
              );
            }
          });
        }
      }
      return response;
    },
    sendNotification: async (requestBody) => {
      options.debug.numberOfManualSendNotificationCalls = incrementValue(
        options.debug.numberOfManualSendNotificationCalls ?? 0,
      );
      return sendNotification(options, requestBody);
    },
    stopRulesPoolingInterval: () => options?.stopRulesPoolingInterval(),
    getDebugInfo: () => options?.debug,
  };
}

export { BaseClient, Container, TOKENS };

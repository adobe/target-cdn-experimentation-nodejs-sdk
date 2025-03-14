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
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const emptyFunction = () => Promise.resolve();
const sendEventMock = jest.fn().mockImplementation(() => emptyFunction);
jest.unstable_mockModule("../src/sendEvent.js", () => ({
  sendEvent: sendEventMock,
}));
const remoteSendEventMock = jest.fn().mockImplementation(() => emptyFunction);
jest.unstable_mockModule("../src/remoteSendEvent.js", () => ({
  remoteSendEvent: remoteSendEventMock,
}));
const sendNotificationMock = jest.fn().mockImplementation(() => emptyFunction);
jest.unstable_mockModule("../src/sendNotification.js", () => ({
  sendNotification: sendNotificationMock,
}));
const ruleEngineMock = jest.fn().mockImplementation(() => ({}));
jest.unstable_mockModule("../src/RuleEngine.js", () => ({
  RuleEngine: ruleEngineMock,
}));
const ruleRequesterMock = jest.fn().mockImplementation(() => emptyFunction);
jest.unstable_mockModule("../src/ruleRequester.js", () => ({
  ruleRequester: ruleRequesterMock,
}));

const { BaseClient } = await import("../src/index.js");

describe("base client", () => {
  const clientOptions = {
    orgId: "test-org-id",
    datastreamId: "test-datastream",
  };

  beforeEach(() => {
    sendEventMock.mockClear();
    remoteSendEventMock.mockClear();
    sendNotificationMock.mockClear();
    ruleEngineMock.mockClear();
    ruleRequesterMock.mockClear();
  });

  it("should return the functions for edge calls when ODD is disabled", async () => {
    const oddDisabledOptions = {
      ...clientOptions,
      oddEnabled: false,
    };

    const client = await BaseClient(oddDisabledOptions);
    client.sendEvent();
    expect(remoteSendEventMock).toHaveBeenCalledTimes(1);
    client.sendNotification();
    expect(sendNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("should return the the functions for local calls when ODD is enabled and rules provided", async () => {
    const oddDisabledOptions = {
      ...clientOptions,
      oddEnabled: true,
      rules: { prop: "value" },
    };

    const client = await BaseClient(oddDisabledOptions);
    expect(ruleEngineMock).toHaveBeenCalledTimes(1);
    client.sendEvent();
    expect(sendEventMock).toHaveBeenCalledTimes(1);
    client.sendNotification();
    expect(sendNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("should return the the functions for local calls when ODD is enabled and rulesRequester when the rules are not provided", async () => {
    const oddDisabledAndNoRulesOptions = {
      ...clientOptions,
      oddEnabled: true,
    };

    const client = await BaseClient(oddDisabledAndNoRulesOptions);
    expect(ruleRequesterMock).toHaveBeenCalledTimes(1);
    expect(ruleEngineMock).toHaveBeenCalledTimes(1);
    client.sendEvent();
    expect(sendEventMock).toHaveBeenCalledTimes(1);
    client.sendNotification();
    expect(sendNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("should should throw error if the rules can't be fetched", async () => {
    const oddDisabledAndNoRulesOptions = {
      ...clientOptions,
      oddEnabled: true,
    };

    ruleRequesterMock.mockImplementationOnce(() => Promise.resolve(null));
    await expect(async () => {
      await BaseClient(oddDisabledAndNoRulesOptions);
    }).rejects.toThrow();
  });
});

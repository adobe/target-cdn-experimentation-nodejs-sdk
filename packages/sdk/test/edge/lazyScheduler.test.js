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
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { createLazyScheduler } from "../../src/edge/lazyScheduler.js";

describe("lazy scheduler", () => {
  let now;
  beforeEach(() => {
    now = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should not run the callback before the interval elapsed", () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn();
    scheduler.start(fn, 5000);

    now += 4999;
    scheduler.maybeRefresh();

    expect(fn).not.toHaveBeenCalled();
  });

  it("should run the callback once the interval elapsed and register it with waitUntil", async () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn().mockResolvedValue("done");
    const waitUntil = jest.fn();
    scheduler.start(fn, 5000);

    now += 5000;
    scheduler.maybeRefresh({ waitUntil });

    expect(waitUntil).toHaveBeenCalledTimes(1);
    await waitUntil.mock.calls[0][0];
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should work without waitUntil", async () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn().mockResolvedValue(undefined);
    scheduler.start(fn, 1000);

    now += 1000;
    expect(() => scheduler.maybeRefresh()).not.toThrow();
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should not start a second run while one is in flight", async () => {
    const scheduler = createLazyScheduler();
    let finish;
    const fn = jest.fn(() => new Promise((resolve) => (finish = resolve)));
    const waitUntil = jest.fn();
    scheduler.start(fn, 1000);

    now += 1000;
    scheduler.maybeRefresh({ waitUntil });
    now += 5000;
    scheduler.maybeRefresh({ waitUntil });
    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);

    finish();
    await waitUntil.mock.calls[0][0];
  });

  it("should restart the interval after a run and survive a failing callback", async () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn().mockRejectedValue(new Error("boom"));
    const waitUntil = jest.fn();
    scheduler.start(fn, 1000);

    now += 1000;
    scheduler.maybeRefresh({ waitUntil });
    await waitUntil.mock.calls[0][0];

    now += 500;
    scheduler.maybeRefresh({ waitUntil });
    expect(waitUntil).toHaveBeenCalledTimes(1);

    now += 500;
    scheduler.maybeRefresh({ waitUntil });
    expect(waitUntil).toHaveBeenCalledTimes(2);
  });

  it("should stop a scheduled callback", () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn();
    const handle = scheduler.start(fn, 1000);

    scheduler.stop(handle);
    now += 5000;
    scheduler.maybeRefresh();

    expect(fn).not.toHaveBeenCalled();
    expect(() => scheduler.stop(undefined)).not.toThrow();
  });

  it("should never fire for an invalid interval", () => {
    const scheduler = createLazyScheduler();
    const fn = jest.fn();
    scheduler.start(fn, undefined);

    now += 10 ** 12;
    scheduler.maybeRefresh();

    expect(fn).not.toHaveBeenCalled();
  });
});

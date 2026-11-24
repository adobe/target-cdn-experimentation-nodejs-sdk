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

/**
 * Scheduler for runtimes without long-lived timers (Akamai EdgeWorkers, Cloudflare Workers).
 * Callbacks are only evaluated when `maybeRefresh` is called, normally once per request.
 * When a `waitUntil` function is passed in, the refresh is registered with it so the
 * runtime keeps the refresh alive after the response has been returned.
 */
export function createLazyScheduler() {
  const scheduled = new Map();
  let nextId = 1;

  const start = (fn, intervalMs) => {
    const id = `${nextId++}`;
    const safeInterval =
      typeof intervalMs === "number" && intervalMs > 0
        ? intervalMs
        : Number.MAX_SAFE_INTEGER;
    scheduled.set(id, {
      fn,
      intervalMs: safeInterval,
      lastRunMs: Date.now(), // the first run happens after one full interval
      inFlight: null,
    });
    return { id };
  };

  const stop = (handle) => {
    if (!handle || !handle.id) return;
    scheduled.delete(handle.id);
  };

  const maybeRefresh = (callOptions) => {
    const waitUntil = callOptions?.waitUntil;
    const now = Date.now();
    for (const entry of scheduled.values()) {
      const due = now - entry.lastRunMs >= entry.intervalMs;
      if (!due || entry.inFlight) continue;
      entry.inFlight = Promise.resolve()
        .then(entry.fn)
        .catch(() => {})
        .finally(() => {
          entry.lastRunMs = Date.now();
          entry.inFlight = null;
        });
      if (typeof waitUntil === "function") {
        waitUntil(entry.inFlight);
      }
    }
  };

  return { start, stop, maybeRefresh };
}

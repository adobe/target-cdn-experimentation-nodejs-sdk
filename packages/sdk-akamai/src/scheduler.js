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

export function createAkamaiScheduler() {
  // Registry of scheduled callbacks (no real timers on Akamai)
  const scheduled = new Map();
  let nextId = 1;

  // Start "interval": record callback, interval, and last run timestamp
  const start = (fn, intervalMs) => {
    const id = `${nextId++}`;
    const safeInterval =
      typeof intervalMs === "number" && intervalMs > 0
        ? intervalMs
        : Number.MAX_SAFE_INTEGER;
    scheduled.set(id, {
      fn,
      intervalMs: safeInterval,
      lastRunMs: Date.now(), // avoid firing immediately; first run occurs after interval
      inFlight: null,
    });
    return { id };
  };

  // Stop a scheduled entry
  const stop = (handle) => {
    if (!handle || !handle.id) return;
    scheduled.delete(handle.id);
  };

  // Tick once: fire any callbacks whose interval elapsed.
  // Non-blocking: callbacks run and update lastRunMs when they complete.
  const maybeRefresh = () => {
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
    }
  };

  return { start, stop, maybeRefresh };
}

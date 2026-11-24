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
 * HTTP client built on the standard fetch API, shared by every runtime that provides it.
 * @param {{ fetch?: typeof fetch, logger?: { log: Function } }} [deps]
 */
export const createFetchAdapter = ({
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
  logger = console,
} = {}) => {
  const makeRequest = async (url, options) => {
    try {
      const response = await fetchImpl(url, options);
      if (response.status === 204) {
        return null;
      }
      if (response.ok) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }

      let errorBody;
      try {
        const text = await response.text();
        try {
          errorBody = JSON.parse(text);
        } catch {
          errorBody = text;
        }
      } catch {
        errorBody = undefined;
      }

      const error = new Error(
        `HTTP ${response.status} ${response.statusText} for ${url}`,
      );
      error.status = response.status;
      error.statusText = response.statusText;
      error.url = url;
      error.body = errorBody;
      logger.log(
        `Failed HTTP response for ${url} with options ${JSON.stringify(options)}`,
        {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        },
      );
      throw error;
    } catch (error) {
      logger.log(
        `Failed to make request for ${url} with options ${JSON.stringify(options)}`,
        error,
      );
      throw error;
    }
  };

  return { makeRequest };
};

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

const createFetchAdapter = () => {
  const makeRequest = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (response.status === 204) {
        return null; // No content to return
      }
      if (response.ok) {
        // Try JSON first, fall back to text if not JSON
        try {
          return await response.json();
        } catch {
          return await response.text();
        }
      }

      // Non-OK: capture response body to aid debugging
      let errorBody;
      try {
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
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
      console.log(
        `Failed HTTP response for ${url} with options ${JSON.stringify(options)}`,
        {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        },
      );
      throw error;
    } catch (error) {
      console.log(
        `Failed to make request for ${url} with options ${JSON.stringify(options)}`,
        error,
      );
      throw error;
    }
  };

  return {
    makeRequest,
  };
};

const httpRequestAdapterInstance = createFetchAdapter();
export { httpRequestAdapterInstance };

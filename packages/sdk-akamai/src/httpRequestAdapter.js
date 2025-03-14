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
import { logger } from "log";
import { httpRequest } from "http-request";

const createHttpRequestAdapter = () => {
  const makeRequest = async (url, options) => {
    try {
      const response = await httpRequest(url, options);
      if (response.status === 204) {
        return null; // No content to return
      }
      if (response.ok) {
        return await response.json();
      }
      logger.log(
        `Failed to make request for ${url} with options ${JSON.stringify(options)}`,
      );
    } catch (error) {
      logger.log(
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
const httpRequestAdapterInstance = createHttpRequestAdapter();
export { httpRequestAdapterInstance };

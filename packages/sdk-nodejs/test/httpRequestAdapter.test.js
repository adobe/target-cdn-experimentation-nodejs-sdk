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
import { describe, it, expect, jest } from "@jest/globals";

const fetchMock = jest.fn();
global.fetch = fetchMock;

const { httpRequestAdapterInstance } = await import(
  "sdk-nodejs/src/httpRequestAdapter.js"
);

describe("httpRequestAdapter", () => {
  it("should make a request and respond with a json", async () => {
    const url = "https://example.com";
    const options = { method: "GET" };
    const response = { json: jest.fn().mockResolvedValue("data") };
    fetchMock.mockResolvedValue(response);

    const result = await httpRequestAdapterInstance.makeRequest(url, options);
    expect(result).toBe("data");
    expect(fetchMock).toHaveBeenCalledWith(url, options);
  });

  it("should throw an error if the request fails", async () => {
    const url = "https://example.com";
    const options = { method: "GET" };
    const errorMessage = "Network error";
    fetchMock.mockRejectedValue(new Error(errorMessage));

    await expect(
      httpRequestAdapterInstance.makeRequest(url, options),
    ).rejects.toThrow(errorMessage);
    expect(fetchMock).toHaveBeenCalledWith(url, options);
  });
});

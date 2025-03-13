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

export const MESSAGES = {
  RULES_ENGINE: {
    FETCH_ERROR: "Failed to fetch rules",
    CREATE_ERROR: "Failed to create rules engine",
    EMPTY_RULES_ERROR: "Rules cannot be empty",
  },
  CONTAINER: {
    INSTANCE_ALREADY_REGISTERED: "Instance already registered",
    INSTANCE_NOT_FOUND: "Instance not found",
  },
  SEND_EVENT: {
    MULTIPLE_ECID: "Multiple ECIDs found in the request. Using the last one.",
  },
};

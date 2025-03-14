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

import { MESSAGES } from "./messages.js";

export const TOKENS = {
  RNG: "RNG",
  LOGGER: "LOGGER",
  HTTP_CLIENT: "HTTP_CLIENT",
  MD5: "MD5",
};

const createRegistry = () => {
  const registry = {};
  const registerInstance = (name, instance) => {
    if (!registry[name]) {
      registry[name] = instance;
    }
  };

  const getInstance = (name) => {
    if (!registry[name]) {
      throw new Error(`${MESSAGES.CONTAINER.INSTANCE_NOT_FOUND}: ${name}`);
    }
    return registry[name];
  };

  return {
    registerInstance,
    getInstance,
  };
};

export const Container = (() => {
  let singletonInstance;

  return () => {
    if (!singletonInstance) {
      singletonInstance = createRegistry();
    }
    return singletonInstance;
  };
})();

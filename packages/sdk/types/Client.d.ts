/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export interface Client {
  (options: ClientOptions): Promise<ClientResponse>;
}

export interface ClientOptions {
  datastreamId: string;
  orgId: string;
  debugEnabled?: boolean;
  edgeDomain?: string;
  edgeBasePath?: string;
  // SPECIFIC TO EDGE WORKER
  propertyToken: string;
  rules?: [];
  oddEnabled?: boolean;
  ruleDomain?: string;
  ruleBasePath?: string;
}
export interface ClientResponse {
  sendEvent: SendEvent;
  sendNotification: SendNotification;
}

export interface SendEventOptions {
  type: string;
  xdm: any;
  data?: Record<any, any>;
  decisionScopes?: string[];
  personalization?: {
    decisionScopes?: string[];
    surfaces?: string[];
    sendDisplayEvent?: boolean;
    decisionContext?: Record<string, any>;
  };
  datasetId?: string;
  edgeConfigOverrides?: Record<string, string>;
}

export interface SendEvent {
  (options: SendEventOptions): any;
}

export interface SendNotificationOptions {
  data?: Record<any, any>;
  type: string;
  xdm: any;
}

export interface SendNotification {
  (options: SendNotificationOptions): Promise<any>;
}

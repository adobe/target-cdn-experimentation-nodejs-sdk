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

export interface Client {
  (options: ClientOptions): Promise<ClientResponse>;
}

export interface ClientOptions {
  datastreamId: string; // the datastreamId from the Adobe Experience Platform that connects to Adobe Target: e.g ebebf826-a01f-4458-8cec-ef61de241c93
  orgId: string; // the organization ID e.g ADB3LETTERSANDNUMBERS@AdobeOrg
  edgeDomain?: string; // default: edge.adobedc.net
  edgeBasePath?: string; // default: ee
  // SPECIFIC TO EDGE WORKER
  propertyToken?: string; // The property token associated with Adobe Target ODD Activities
  rules?: Record<string, any>; // Inline rules that can be used to evaluate the event
  rulesPoolingInterval?: number; // Interval in second to pool the rules from the server; if not provided the rules are not pooled
  oddEnabled: boolean; // Enable local decisioning or go to the Adobe Target servers
  ruleDomain?: string; // default: assets.adobetarget.com; Override the domain for the rules for an internal server
  ruleBasePath?: string; // default: aep-odd-rules; Override the base path for the rules;
}
export interface ClientResponse {
  sendEvent: SendEvent;
  sendNotification: SendNotification;
  stopRulesPoolingInterval: () => void;
}

export interface EventOptions {
  type: string;
  xdm: Record<any, any>;
  data?: Record<any, any>;
  decisionScopes?: string[];
  personalization?: {
    decisionScopes?: string[];
    surfaces?: string[];
    sendDisplayEvent?: boolean;
    decisionContext?: Record<string, any>;
  };
}

export interface EventResponse {
  requestId: string;
  handle: EventResponseHandle[];
}

export interface EventResponseHandle {
  type: string;
  payload:  Record<any, any>[];
  eventIndex?: number;
}

export interface SendEvent {
  (options: EventOptions): Promise<EventResponse>;
}

export interface SendNotification {
  (options: EventOptions): Promise<EventResponse>;
}

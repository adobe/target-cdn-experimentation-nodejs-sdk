##  Target CDN Experimentation - NodeJS SDK 

The "Target CDN Experimentation - NodeJS SDK" can be used to run A/B tests in Akamai EdgeWorkers based on Adobe Target activities that are [ODD - On Device Decisioning enabled](https://experienceleague.adobe.com/en/docs/target-dev/developer/server-side/on-device-decisioning/overview) and using Adobe Experience Platform [Web SDK API's](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/home).


### Setup
1) In the NodeJS platform, make sure that your server can reach Adobe domains:
  - `edge.adobedc.net` used to contact the Adobe Edge [/interact](https://developer.adobe.com/data-collection-apis/docs/endpoints/interact/) and [/collect](https://developer.adobe.com/data-collection-apis/docs/endpoints/collect/) endpoints 
  - `assets.adobetarget.com` used to retrieve the `rules.json` file that holds the Adobe Target ODD activities and conditions 


2) Install the package
```bash
npm i @adobe/target-cdn-experimentation-nodejs-sdk
```

### Options

Possible options when creating the `Client`

```javascript
ClientOptions {
  datastreamId: string;  // the datastreamId from the Adobe Experience Platform that connects to Adobe Target: e.g ebebf826-a01f-4458-8cec-ef61de241c93
  orgId: string; // the Adobe Target organization ID e.g ADB3LETTERSANDNUMBERS@AdobeOrg
  propertyToken: string; // the property token associated with the datastream and the Target activities
  oddEnabled: boolean; // true - Enable local decisioning; false - acts as a proxy, all requests go to Adobe Edge servers
  edgeDomain?: string; // default: edge.adobedc.net; Override the domain 
  edgeBasePath?: string; // default: ee; 
  rules?: Record<string, any>; // Inline rules that can be used to evaluate the events; Can be retrieved from assets.adobetarget.com
  rulesPoolingInterval?: number; // Interval in seconds to pool the rules from the Adobe server; if not provided the rules are not pooled
  ruleDomain?: string; // default: assets.adobetarget.com; Override the domain for the rules 
  ruleBasePath?: string; // default: aep-odd-rules; Override the base path for the rules;
}
```

The Client will return 3 functions where the event is in the format expected by Alloy [SendEvent](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/sendevent/overview) command
```javascript
{
  sendEvent(event), //  evaluates the event against the rules and provides a response 
  sendNotification(event), // return void if successful or throw an error; notifies the Adobe servers of an event
  stopRulesPoolingInterval() // return void; stop rules Pooling 
}
```

### General workflow 
1) Client initialization
  - Retrives location hint information from [Adobe Edge Network](https://developer.adobe.com/data-collection-apis/docs/getting-started/location-hints/)
  - If `oddEnabled:true` 
    - if the `rules` are not provided inline, it retrieves the rules from `https://assets.adobetarget.com/aep-odd-rules/<orgId>/production/v1/<propertyToken>/rules.json` 
    - if `rulesPoolingInterval` is set, it schedules the pooling interval
  - Returns the initializd Client 
- If the initialization fails an error is thrown
2)  SendEvent function
  - If `oddEnabled:false` the request and response are proxied to/from Adobe Edge servers
  - If `oddEnabled:true` 
    - retrieves the [ECID](https://experienceleague.adobe.com/en/docs/id-service/using/intro/overview) from the request or generates one if it's not present (random or based on FPID)
    - evaluates the rules against the Event
    - add LocationHintId
  - Returns the WebSDK response with the activities that match the rules
3) Based on the Response the customer has to persist inside the browser the ECID and LocationHintId and to be added each subsequent request for `sendEvent`

### Usage

1) Inside your Akmai project import the Client
```javascript
import { Client } from "@adobe/target-cdn-experimentation-nodejs-sdk";
```

3) Create and configure the client
```javascript
  ...
  const client =  await Client({
    datastreamId: "DATASTREAM_ID",
    orgId: "ORG_ID", 
    propertyToken: "PROPERTY_TOKEN", 
    oddEnabled: true, // enable local decisioning
    rules: imported_rules // rules downloaded ahead of time from assets.adobetarget.com
});
  ...
```
4)  Retrieve the results for a specific request 
```javascript
    const basicEvent = {
      type: "decisioning.propositionFetch",
      personalization: {
        sendDisplayEvent: true, // send a display event automatically to the Edge servers
      },
      xdm: {
        web: {
          webPageDetails: { URL: `${req.protocol}://${req.headers.host}${req.url}` },
          webReferrer: { URL: "" },
        },
        implementationDetails: {
          name: "server-side",
        },
      },
    }
    const sdkResponse = await client.sendEvent(basicEvent);
```

5) Process the `sdkResponse`
```javascript
      res.end(JSON.stringify(sdkResponse));
```

### Notes
- The ECID and LocationHintId have to be saved for each visitor inside the browser to maintain the same A/B experience and to send the Notification events to the same Edge server
- Differences between [Adobe Target NodeJS](https://experienceleague.adobe.com/en/docs/target-dev/developer/server-side/node-js/overview)
  - Current package uses the WebSDK API's and request/response format instead of the Target one 
  - The rule engine and rules.json format is different; it uses the [@adobe/aep-rules-engine](https://www.npmjs.com/package/@adobe/aep-rules-engine)
  - All string comparisons done by the rules engine are done in a lower case and case insensitive way (url's, mbox values etc.)
  - If no `decisionScopes` are provided we default to `__view__ / target-global-mbox`
  - It's purpose is to fit EdgeWorkers contraints so it's features and size is smaller
  - The current package is still in development and it's not as mature as Adobe Target NodeJS.
- At the moment the library offers support for global mbox parameters in the Event in the `data.__adobe.target` [object](https://experienceleague.adobe.com/en/docs/platform-learn/migrate-target-to-websdk/send-parameters#parameter-mapping-summary)


### Example of a complex Event

```javascript
{
    "type": "decisioning.propositionFetch",
    "personalization": {
      "sendDisplayEvent": true // send the display event automatically
    },
    "decisionScopes": ["__view__", "customMbox"]
    "xdm": {
      "identityMap": {
        "ECID": [
          {
            "id": "58520666134237204046201991105089158464" // the ECID stored in the clients browser
          }
        ],
        "FPID": [
          {
            "id": "custom-FPID-string" // custom FPID 
          }
        ]
      },
      "web": {
        "webPageDetails": {
          "URL": `${req.protocol}://${req.headers.host}${req.url}`
        },
        "webReferrer": {
          "URL": ""
        }
      },
      "implementationDetails": {
        "name": "server-side"
      }
    },
    "data": {
      "__adobe": {
        "target": {
          "mboxParameter": "mboxValue" // global mbox parameter 
        }
      }
    }

  },
```


### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

import { Client } from "../src/index.js";
import { rules } from "./rules.js";
import { createClientRequest, getPersistedValues } from "./utils.js";

const CONFIG = {
  datastreamId: "906E3A095DC834230A495FD6@AdobeOrg", // the datastreamId from the Adobe Experience Platform that connects to Adobe Target: e.g ebebf826-a01f-4458-8cec-ef61de241c93
  orgId: "087b825c-79d3-4bb9-8bfc-c8116eb64501", // the organization ID e.g ADB3LETTERSANDNUMBERS@AdobeOrg
  propertyToken: "", // the property token associated with the datastream and the Target activities
  oddEnabled: true,
  edgeDomain: "abc.adobelab2025.com",
  rules: rules, // pass the inline rules.json retrieved from https://assets.adobetarget.com/aep-odd-rules/<ORG_ID>/production/v1/<PROPERTY_TOKEN>/rules.json
};
let client = null;

export async function onClientRequest(request) {
  try {
    // Initialize the client and keep a reference to it so that it can be reused across requests
    client = client || (await Client(CONFIG));

    // create an event from the incoming request
    const alloyEvent = createClientRequest(request);

    // retrieve the response that holds the consequences
    const sdkResponse = await client.sendEvent(alloyEvent);

    // retrieve the ECID and locationHintId; both values have to be persisted in the browser across requests
    // ECID - identifies each unique visitor with an unique id
    // locationHintId - the locationHintId is used to route the request to the closest Edge Node
    const { ecid, locationHintId } = getPersistedValues(sdkResponse);

    request.respondWith(
      200,
      {
        "Powered-By": ["Akamai EdgeWorkers" + Date.now()],
        "X-ADOBE-ECID": ecid,
        "X-ADOBE-LOCATION-HINT": locationHintId,
      },
      JSON.stringify(sdkResponse),
    );
  } catch (error) {
    request.respondWith(
      500,
      { "Powered-By": ["Akamai EdgeWorkers"] },
      `${request.method}: ${error.message}`,
    );
  }
}

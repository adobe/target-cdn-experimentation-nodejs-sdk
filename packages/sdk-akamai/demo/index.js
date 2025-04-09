import { createResponse } from "create-response";
import { Client } from "../src/index.js";
import { rules } from "./rules.js";
import { createClientRequest, getPersistedValues } from "./utils.js";

const CONFIG = {
  datastreamId: "DATASTREAM_ID", // the datastreamId from the Adobe Experience Platform that connects to Adobe Target: e.g ebebf826-a01f-4458-8cec-ef61de241c93
  orgId: "ORG_ID", // the organization ID e.g ADB3LETTERSANDNUMBERS@AdobeOrg
  oddEnabled: true,
  edgeDomain: "abc.adobelab2025.com",
  rules: rules, // pass the inline rules.json retrieved from https://assets.adobetarget.com/aep-odd-rules/<ORG_ID>/production/v1/<PROPERTY_TOKEN>/rules.json
};
let client = null;

export async function responseProvider(request) {
  try {
    // Initialize the client and keep a reference to it so that it can be reused across requests
    client = client || (await Client(CONFIG));

    // create an event from the incoming request
    const alloyEvent = createClientRequest(request, CONFIG);

    // retrieve the response that holds the consequences
    const sdkResponse = await client.sendEvent(alloyEvent);

    // retrieve the ECID and locationHintId; both values have to be persisted in the browser across requests
    // ECID - identifies each unique visitor with an unique id
    // locationHintId - the locationHintId is used to route the request to the closest Edge Node
    const { ecid, locationHintId } = getPersistedValues(sdkResponse);

    const response = `
    <script>
      document.cookie = "ECID=${ecid}; path=/";
      document.cookie = "kndctr_${CONFIG.orgId.replace("@", "_")}_cluster=${locationHintId}; path=/";
    </script>
    <pre>${JSON.stringify(alloyEvent, " ", 2)}</pre>
    <pre>${JSON.stringify(sdkResponse, " ", 2)}</pre>
    `;
    return createResponse(
      200,
      {
        "Powered-By": ["Akamai EdgeWorkers" + Date.now()],
      },
      response,
    );
  } catch (error) {
    return createResponse(
      500,
      {
        "Powered-By": ["Akamai EdgeWorkers"],
      },
      `${request.method}: ${error.message}`,
    );
  }
}

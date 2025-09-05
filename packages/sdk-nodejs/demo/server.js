import { createServer } from "http";
import { Client } from "../src/index.js";
import { rules } from "./rules.js";
import { createClientRequest, getPersistedValues } from "./utils.js";

const config = {
  orgId: "692D3C645C5CDA980A495CB3@AdobeOrg",
  datastreamId: "0a99f011-c398-43cd-a6e4-3bb05ed8eb62",
  oddEnabled: true,
  rules: rules
};

const client = await Client(config);
const handleGET = async (req, res) => {
  try {
    // create an event from the incoming request
    const alloyEvent = createClientRequest(req);

    // retrieve the response that holds the consequences
    console.log("calling sendEvent", req.url);
    const sdkResponse = await client.sendEvent(alloyEvent);
    console.log("sdkResponse", JSON.stringify(sdkResponse, null, 2));

    // retrieve the ECID and locationHintId; both values have to be persisted in the browser across requests
    // ECID - identifies each unique visitor with an unique id
    // locationHintId - the locationHintId is used to route the request to the closest Edge Node
    const { ecid, locationHintId } = getPersistedValues(sdkResponse);

    const clusterCookieName = `kndctr_${config.orgId.replace("@", "_")}_cluster`;
    res.setHeader("Set-Cookie", [
      `ECID=${ecid};`,
      `${clusterCookieName}=${locationHintId};`,
    ]);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ sdkResponse }, null, 2));
  } catch (error) {
    console.log("error ", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(error.message);
  }
};

const server = createServer((req, res) => {
  switch (req.method) {
    case "GET":
      if (req.url.includes("favicon")) {
        res.writeHead(200, { "Content-Type": "image/x-icon" });
        res.end();
      } else {
        handleGET(req, res);
      }
      break;
    default:
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
  }
});
server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});

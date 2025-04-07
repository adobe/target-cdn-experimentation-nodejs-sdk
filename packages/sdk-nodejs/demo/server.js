import { createServer } from "http";
import { Client } from "../src/index.js";
import { rules } from "./rules.js";
import { createClientRequest, getPersistedValues } from "./utils.js";

const config = {
  orgId: "ORG_ID",
  datastreamId: "DATASTREAM_ID",
  oddEnabled: true,
  rules: rules,
};

const client = await Client(config);
const handleGET = async (req, res) => {
  try {
    // create an event from the incoming request
    const alloyEvent = createClientRequest(req);

    // retrieve the response that holds the consequences
    const sdkResponse = await client.sendEvent(alloyEvent);

    // retrieve the ECID and locationHintId; both values have to be persisted in the browser across requests
    // ECID - identifies each unique visitor with an unique id
    // locationHintId - the locationHintId is used to route the request to the closest Edge Node
    const { ecid, locationHintId } = getPersistedValues(sdkResponse);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Set-Cookie", [
      `ECID=${ecid};`,
      `LOCATION_HINT=${locationHintId};`,
    ]);
    res.end(JSON.stringify(sdkResponse));
  } catch (error) {
    console.log("error ", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(error.message);
  }
};

const server = createServer((req, res) => {
  switch (req.method) {
    case "GET":
      handleGET(req, res);
      break;
    default:
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
  }
});
server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});

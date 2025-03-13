import fs from "fs";
import { createServer } from "http";
import { Client } from "../src/index.js";
import { DATASTREAM_ID, ORG_ID } from "./config.js";
import { rules } from "./rules.js";

const client = await Client({
  datastreamId: DATASTREAM_ID,
  orgId: ORG_ID,
  oddEnabled: true,
  rules
});

const handleGET = (req, res) => {
  let fileName = req.url;
  let contentType = "application/json";
  if (req.url === "/") {
    fileName = "/index.html";
    contentType = "text/html";
  }
  try {
    const index = fs.readFileSync(`.${fileName}`);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(index);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
};

const handlePOST = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    res.writeHead(200, { "Content-Type": "application/json" });
    try {
      body = JSON.parse(body);
      const response = await client.sendEvent(JSON.parse(body.event));

      const getPayloadsByType = (response, type) => {
        return response.handle
          .filter((fragment) => fragment.type === type)
          .flatMap((fragment) => fragment.payload);
      };
      const extractDecisionsMeta = (payload) => {
        return payload.map((decision) => {
          const { id, scope, scopeDetails } = decision;
          return { id, scope, scopeDetails };
        });
      };
      const createNotificationEvent = (propositions) => {
        return {
          xdm: {
            _experience: {
              decisioning: {
                propositions,
              },
            },
            eventType: "decisioning.propositionDisplay",
          },
        };
      };

      const decisions = getPayloadsByType(
        response,
        "personalization:decisions",
      );
      const decisionMeta = extractDecisionsMeta(decisions);
      const propositionEvent = createNotificationEvent(decisionMeta);
      client.sendNotification(propositionEvent);

      res.end(JSON.stringify(response));
    } catch (error) {
      console.log("error ", error);
      res.end(JSON.stringify(error));
    }
  });
};

const server = createServer((req, res) => {
  switch (req.method) {
    case "GET":
      handleGET(req, res);
      break;
    case "POST":
      handlePOST(req, res);
      break;
    default:
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
  }
});
server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});

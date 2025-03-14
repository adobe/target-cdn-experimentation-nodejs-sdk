import fs from "fs";
import { createServer } from "http";
import { Client } from "../src/index.js";

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
      const request = JSON.parse(body);
      const event = JSON.parse(request.event);
      const config = JSON.parse(request.config);

      console.log("Parsed request - init client", JSON.stringify(config));
      const client = await Client(config);
      console.log("Finished client");

      console.log("Init sendEvent", JSON.stringify(event));
      const response = await client.sendEvent(event);
      console.log("Finished sendEvent", JSON.stringify(response));

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

import { Client } from "../src/index.js";
import { rules } from "./rules.js";
import { logger } from "log";
import { createResponse } from "create-response";
import { httpRequest } from "http-request";
import { HtmlRewritingStream } from "html-rewriter";
import {DATASTREAM_ID, ORG_ID, ORIGIN_URL, PROPERTY_TOKEN} from "./config.js";
import {
  addAlloyJsLib,
  createClientRequest,
  persistEcidInCookie,
} from "./utils.js";
let client = undefined;

export async function responseProvider(request) {
  try {
    const streamRewriter = new HtmlRewritingStream();
    const originUrl = ORIGIN_URL;
    const originResponse = await httpRequest(originUrl);
    const alloyEvent = createClientRequest(request);

    // HybridMode: insert decisions in the HTML and apply it in the browser instead of doing it server side
    const isHybridMode = request.query.includes("hybrid");
    logger.log("Hybrid mode: ", isHybridMode);

    if (isHybridMode) {
      await addAlloyJsLib(streamRewriter, httpRequest);
      logger.log("addAlloyJsLib: ", "done");
    }

    streamRewriter.onElement("head", (el) => {
      el.append(`<script>
                ${ODD_BROWSER_CONFIG}
               </script>`);
    });
    logger.log("adding ODD_BROWSER_CONFIG: ");

    client =
      client ||
      (await Client({
        datastreamId: DATASTREAM_ID,
        orgId: ORG_ID,
        oddEnabled: true,
        rules: rules,
      }));

    const responseWithConsequences = await client.sendEvent(alloyEvent);
    logger.log(
      "response with consequences ",
      responseWithConsequences.handle.length,
    );

    const ecidValue = persistEcidInCookie(
      streamRewriter,
      responseWithConsequences,
    );
    logger.log("persistEcidInCookie: ", ecidValue);

    const propositions = responseWithConsequences.handle
      .filter((payload) => payload.type === "personalization:decisions")
      .flatMap((payload) => payload.payload);

    const consequenceItems = responseWithConsequences.handle
      .filter((payload) => payload.type === "personalization:decisions")
      .map((consequence) => consequence.payload.map((payload) => payload.items))
      .flat(2);

    // Add debug info in the HTML stream
    streamRewriter.onElement("body", (el) => {
      const debugInfoInline = `
            <script>
            const debugInfo = JSON.stringify({
                originUrl: '${originUrl}',
                ecidCookie: '${ecidValue || "not set"}',
                consequences: ${JSON.stringify(consequenceItems)},
                alloyEvent:  ${JSON.stringify(alloyEvent)}, 
            });
            console.log('Debug Info: ', debugInfo);
            </script>
            `;
      el.append(debugInfoInline);
    });

    if (isHybridMode) {
      streamRewriter.onElement("body", (el) => {
        const applyJsonDecisions = `
          <script>
             window.initPropositionsDecisions = ${JSON.stringify(propositions)};
          </script>
          `;
        el.append(applyJsonDecisions);
      });
      // Create a simple response and return it to the client
      return createResponse(
        200,
        {
          "Powered-By": ["Akamai EdgeWorkers" + new Date().toString()],
        },
        originResponse.body.pipeThrough(streamRewriter),
      );
    }

    // insert in script tag the consequences
    consequenceItems.forEach((item) => {
      switch (item.schema) {
        case "https://ns.adobe.com/personalization/json-content-item":
          if (Array.isArray(item.data.content.payload)) {
            item.data.content.payload.forEach((content) => {
              streamRewriter.onElement(content.selector, (el) => {
                if (content.type === "outerHTML") {
                  el.replaceWith(content.payload);
                }
                if (content.type === "innerHTML") {
                  el.replaceChildren(content.payload);
                }
              });
            });
          }
          break;
        case "https://ns.adobe.com/personalization/dom-action":
          streamRewriter.onElement(item.data.selector, (el) => {
            el.replaceWith(item.data.content);
          });
          break;
      }
    });

    // Create a simple response and return it to the client
    return createResponse(
      200,
      {
        "Powered-By": ["Akamai EdgeWorkers" + new Date().toString()],
      },
      originResponse.body.pipeThrough(streamRewriter),
    );
  } catch (error) {
    return createResponse(
      500,
      { "Powered-By": ["Akamai EdgeWorkers"] },
      `${request.method}: ${error.message}`,
    );
  }
}

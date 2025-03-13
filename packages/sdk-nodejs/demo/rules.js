export const rules = {
  version: 1,
  provider: "TGT",
  metadata: {
    provider: "TGT",
    providerData: {
      identityTemplate: "template.<key>.<identity>",
      buckets: 2,
    },
  },
  rules: [
    {
      key: "activity1",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "xdm.web.webPageDetails.URL",
                matcher: "co",
                values: ["/v1/personalization?ExpA"],
              },
            },
          ],
        },
      },
      consequences: [
        {
          id: "consequence-1",
          type: "proposition",
          detail: {
            id: "proposition-1",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "1234",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  format: "application/vnd.adobe.target.json-content-item",
                  content: {
                    experience: "URL Matcher - Experience A",
                    property: "Workspace1Property1",
                    location: "workspace1-activity2-location2-pageD",
                    asset: "demo-marketing-offer1-exp-A.png",
                    color: "coral",
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "activity1",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "xdm.web.webPageDetails.URL",
                matcher: "co",
                values: ["/v1/personalization?ExpB"],
              },
            },
          ],
        },
      },
      consequences: [
        {
          id: "consequence-2",
          type: "proposition",
          detail: {
            id: "proposition-1",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "1234",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  format: "application/vnd.adobe.target.json-content-item",
                  content: {
                    experience: "URL Matcher - Experience B",
                    property: "Workspace1Property1",
                    location: "workspace1-activity2-location2-pageD",
                    asset: "demo-marketing-offer1-exp-A.png",
                    color: "coral",
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "activity2",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "lt",
                values: [50],
              },
            },
          ],
        },
      },
      consequences: [
        {
          id: "consequence-3",
          type: "proposition",
          detail: {
            id: "proposition-1",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "1234",
                schema: "https://ns.adobe.com/personalization/dom-action",
                meta: {},
                data: {
                  type: "setHtml",
                  format: "application/vnd.adobe.target.dom-action",
                  content:
                    "Your Experience A forked repo is set up as an AEM Project and you are ready to start developing.<br />\\nThe content you are looking at is served from this",
                  selector:
                    "HTML > BODY > MAIN:nth-of-type(1) > DIV.section:eq(1) > DIV.default-content-wrapper:eq(0) > P:nth-of-type(2)",
                  prehidingSelector:
                    "HTML > BODY > MAIN:nth-of-type(1) > DIV:nth-of-type(2) > DIV:nth-of-type(1) > P:nth-of-type(2)",
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "activity2",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "ge",
                values: [50],
              },
            },
          ],
        },
      },
      consequences: [
        {
          id: "consequence-4",
          type: "proposition",
          detail: {
            id: "proposition-1",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "1234",
                schema: "https://ns.adobe.com/personalization/dom-action",
                meta: {},
                data: {
                  type: "setHtml",
                  format: "application/vnd.adobe.target.dom-action",
                  content:
                    "Your Experience B forked repo is set up as an AEM Project and you are ready to start developing.<br />\\nThe content you are looking at is served from this ",
                  selector:
                    "HTML > BODY > MAIN:nth-of-type(1) > DIV.section:eq(1) > DIV.default-content-wrapper:eq(0) > P:nth-of-type(2)",
                  prehidingSelector:
                    "HTML > BODY > MAIN:nth-of-type(1) > DIV:nth-of-type(2) > DIV:nth-of-type(1) > P:nth-of-type(2)",
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "activity3",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "decisionScopes.0",
                matcher: "co",
                values: ["sample-offer"],
              },
            },
          ],
        },
      },
      consequences: [
        {
          id: "consequence-5",
          type: "proposition",
          detail: {
            id: "proposition-5",
            scope: "sample-offer",
            scopeDetails: {},
            items: [
              {
                id: "1234",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  format: "application/vnd.adobe.target.json-content-item",
                  content: {
                    experience: "Decision scope Matcher - Experience",
                    property: "MyDecisionScopeMatcher",
                    location: "locationDecisionScope",
                    asset: "demo-marketing-offer1-exp-A.png",
                    color: "coral",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

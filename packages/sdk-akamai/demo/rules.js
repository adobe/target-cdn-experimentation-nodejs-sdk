export const rules = {
  version: "1",
  provider: "TGT",
  metadata: {
    provider: "TGT",
    providerData: {
      identityTemplate:
        "aemonacpprodcampaign.\u003Ckey\u003E.\u003Cidentity\u003E.0",
      buckets: 10000,
    },
  },
  rules: [
    {
      key: "2194598",
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
                values: [0],
              },
            },
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "le",
                values: [100],
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
            id: "AT:eyJhY3Rpdml0eUlkIjoiMjE5NDU5OCIsImV4cGVyaWVuY2VJZCI6IjAifQ==",
            scope: "cdn-sdk-mbox-test",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "2194598",
              },
              experience: {
                id: "0",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "ry/rOekr8XHRif0OuM4T+aOGVi4KWyOJymGoDplZOhURgQBb+TOXNzkdfJKkycp+UPOSvduUPtusIczTp7IuSQ==",
              },
              correlationID: "2194598:0:0",
            },
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {
                  "activity.id": "2194598",
                  "activity.name": "CDN_SDK_ae_test",
                  "activity.type": "ab",
                  "experience.id": "0",
                  "experience.name": "Experience A",
                  "location.name": "cdn-sdk-mbox-test",
                  "location.type": "mbox",
                  "location.id": "0",
                  "audience.ids": [],
                  "offer.id": "1013189",
                  "offer.name": "create_json_a",
                  "option.id": "2",
                  "option.name": "create_json_a",
                },
                data: {
                  id: "0",
                  format: "application/json",
                  content: {
                    PAYLOAD: "a",
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "2194598",
      condition: {
        type: "matcher",
        definition: {
          key: "tgt.page.query",
          matcher: "co",
          values: ["queryMatch"],
        },
      },
      consequences: [
        {
          id: "consequence-1",
          type: "proposition",
          detail: {
            id: "AT:eyJhY3Rpdml0eUlkIjoiMjE5NDU5OCIsImV4cGVyaWVuY2VJZCI6IjAifQ==",
            scope: "cdn-sdk-mbox-test",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "2194598",
              },
              experience: {
                id: "0",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "ry/rOekr8XHRif0OuM4T+aOGVi4KWyOJymGoDplZOhURgQBb+TOXNzkdfJKkycp+UPOSvduUPtusIczTp7IuSQ==",
              },
              correlationID: "2194598:0:0",
            },
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {
                  "activity.id": "2194598",
                  "activity.name": "CDN_SDK_ae_test",
                  "activity.type": "ab",
                  "experience.id": "0",
                  "experience.name": "Experience A",
                  "location.name": "cdn-sdk-mbox-test",
                  "location.type": "mbox",
                  "location.id": "0",
                  "audience.ids": [],
                  "offer.id": "1013189",
                  "offer.name": "create_json_a",
                  "option.id": "2",
                  "option.name": "create_json_a",
                },
                data: {
                  id: "0",
                  format: "application/json",
                  content: {
                    PAYLOAD: "queryMatch",
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "137928",
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
                values: [0],
              },
            },
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "le",
                values: [50],
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
            id: "AT:eyJhY3Rpdml0eUlkIjoiMTM3OTI4IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
            scope: "ss-control-test",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "137928",
              },
              experience: {
                id: "0",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "lTSAM5d+oUMC6eYISVAUZ2qipfsIHvVzTQxHolz2IpSCnQ9Y9OaLL2gsdrWQTvE54PwSz67rmXWmSnkXpSSS2Q==",
              },
              correlationID: "137928:0:0",
            },
            items: [],
          },
        },
      ],
    },
    {
      key: "137928",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "gt",
                values: [50],
              },
            },
            {
              type: "matcher",
              definition: {
                key: "allocation",
                matcher: "le",
                values: [100],
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
            id: "AT:eyJhY3Rpdml0eUlkIjoiMTM3OTI4IiwiZXhwZXJpZW5jZUlkIjoiMSJ9",
            scope: "ss-control-test",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "137928",
              },
              experience: {
                id: "1",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "lTSAM5d+oUMC6eYISVAUZ5NWHtnQtQrJfmRrQugEa2qCnQ9Y9OaLL2gsdrWQTvE54PwSz67rmXWmSnkXpSSS2Q==",
              },
              correlationID: "137928:1:0",
            },
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/html-content-item",
                meta: {
                  "activity.id": "137928",
                  "activity.name": "Swarna Test - control",
                  "activity.type": "ab",
                  "experience.id": "1",
                  "experience.name": "Experience B",
                  "location.name": "ss-control-test",
                  "location.type": "mbox",
                  "location.id": "0",
                  "audience.ids": [],
                  "offer.id": "255409",
                  "offer.name": "SS Html Offer",
                  "option.id": "2",
                  "option.name": "Offer2",
                },
                data: {
                  id: "0",
                  format: "text/html",
                  content:
                    '\u003Chtml\u003E\u003Cbody\u003E\u003Cp style="color:red; font-size:40px;position: absolute;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%)"\u003EThis is a sample HTML Offer.\u003C/p\u003E\u003C/body\u003E\u003C/html\u003E\n',
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "145840",
      condition: {
        type: "matcher",
        definition: {
          key: "data.__adobe.target.myAnimal",
          matcher: "eq",
          values: ["dog"],
        },
      },
      consequences: [
        {
          id: "consequence-1",
          type: "proposition",
          detail: {
            id: "AT:eyJhY3Rpdml0eUlkIjoiMTQ1ODQwIiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
            scope: "previewDemo",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "145840",
              },
              experience: {
                id: "0",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "RyFzxinv/b+9cWdG1/gonmqipfsIHvVzTQxHolz2IpSCnQ9Y9OaLL2gsdrWQTvE54PwSz67rmXWmSnkXpSSS2Q==",
              },
              correlationID: "145840:0:0",
            },
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/html-content-item",
                meta: {
                  "activity.id": "145840",
                  "activity.name": "Target Preview Demo",
                  "activity.type": "landing",
                  "experience.id": "0",
                  "experience.name": "Experience B",
                  "location.name": "previewDemo",
                  "location.type": "mbox",
                  "location.id": "0",
                  "audience.ids": ["1894022"],
                  "offer.id": "334983",
                  "offer.name":
                    "/archanadogcatexperiencecopy/experiences/0/pages/0/zones/0/1660940902803",
                  "option.id": "2",
                  "option.name": "Offer2",
                },
                data: {
                  id: "0",
                  format: "text/html",
                  content:
                    '\u003C!-- An HTML with embedded dog picture--\u003E\n\u003Ch2\u003EHello from doggie.\u003C/h2\u003E\n\u003Cp style="font-size: 1.5em;"\u003E&nbsp;\u003C/p\u003E\n\u003Ccenter\u003E\u003Ca href="https://www.fillster.com/dog-pictures/1/" target="_blank" rel="noopener"\u003E\u003Cimg src="https://www.fillster.com/images/pictures/10p.jpg" alt="Dog Pictures for Myspace" border="0" /\u003E\u003C/a\u003E\u003Cbr /\u003E\u003Cbr /\u003E\u003C/center\u003E',
                },
              },
            ],
          },
        },
      ],
    },

    {
      key: "142046",
      condition: {
        type: "group",
        definition: {
          logic: "and",
          conditions: [],
        },
      },
      consequences: [
        {
          id: "consequence-1",
          type: "proposition",
          detail: {
            id: "AT:eyJhY3Rpdml0eUlkIjoiMTQyMDQ2IiwiZXhwZXJpZW5jZUlkIjoiMSJ9",
            scope: "mboxtestmay",
            scopeDetails: {
              decisionProvider: "TGT",
              activity: {
                id: "142046",
              },
              experience: {
                id: "1",
              },
              strategies: [
                {
                  step: "entry",
                  trafficType: "0",
                },
                {
                  step: "display",
                  trafficType: "0",
                },
                {
                  step: "conversion",
                  trafficType: "0",
                },
              ],
              characteristics: {
                eventToken:
                  "859yJzB6PYfVerTyryeVS5NWHtnQtQrJfmRrQugEa2qCnQ9Y9OaLL2gsdrWQTvE54PwSz67rmXWmSnkXpSSS2Q==",
              },
              correlationID: "142046:1:0",
            },
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/html-content-item",
                meta: {
                  "activity.id": "142046",
                  "activity.name": "Mbox Test",
                  "activity.type": "landing",
                  "experience.id": "1",
                  "experience.name": "Experience B",
                  "location.name": "mboxtestmay",
                  "location.type": "mbox",
                  "location.id": "0",
                  "audience.ids": [],
                  "offer.id": "266477",
                  "offer.name": "SS Html Offer - color red",
                  "option.id": "3",
                  "option.name": "Offer3",
                },
                data: {
                  id: "0",
                  format: "text/html",
                  content:
                    '\u003Chtml\u003E\u003Cbody\u003E\u003Cp style="color:red; font-size:40px;position: absolute;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%)"\u003EThis is a sample HTML Offer.\u003C/p\u003E\u003C/body\u003E\u003C/html\u003E\n',
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

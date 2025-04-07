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
      key: "activityId",
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
            id: "AT:key",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  id: "0",
                  format: "application/json",
                  content: {
                    experience: "A",
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      key: "activityId",
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
            id: "AT:key",
            scope: "__view__",
            scopeDetails: {},
            items: [
              {
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  id: "0",
                  format: "application/json",
                  content: {
                    experience: "B",
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

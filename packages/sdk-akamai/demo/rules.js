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
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  id: "0",
                  format: "application/json",
                  content: {},
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
                id: "0",
                schema:
                  "https://ns.adobe.com/personalization/json-content-item",
                meta: {},
                data: {
                  id: "0",
                  format: "application/json",
                  content: {
                    payload: [
                      {
                        selector:
                          "#experience-the-magic-unforgettable-carousel-rides-for-the-whole-family",
                        type: "innerHTML",
                        payload:
                          "Experience the Magic: Unforgettable Carousel Rides for the Whole Family (A)!",
                      },
                      {
                        selector: "main > div > p > picture",
                        type: "outerHTML",
                        payload:
                          "<picture style='min-height:420px'><source srcset='https://luma.enablementadobe.com/content/luma/us/en/men/_jcr_content/root/hero_image.coreimg.jpeg' /><img src='https://luma.enablementadobe.com/content/luma/us/en/men/_jcr_content/root/hero_image.coreimg.jpeg'/></picture>",
                        browser: {
                          selector: ".hero picture",
                        },
                      },
                      {
                        selector: ".quote",
                        type: "outerHTML",
                        payload:
                          "<div class='form'> <div><div><a href='/loginform.json'>https://main--aem-cdn-experimentation-demo--aenascut.hlx.page/loginform.json</a></div></div><div><div><a href='https://httpbin.org/post'>https://httpbin.org/post</a></div></div></div>",
                        browser: {
                          selector: "body > main > div:nth-child(3)",
                          payload:
                            "<div class='section highlight form-container' style='display: none'><div class='form-wrapper'><div class='form block' data-block-name='form'><form data-action='https://httpbin.org/post'><div class='field-wrapper heading-wrapper' data-fieldset=''><h2 id='form-headline'>Please Login</h2></div><div class='field-wrapper plaintext-wrapper' data-fieldset=''><p id='form-description'>Login to catch the latest offers and promotions</p></div><div class='field-wrapper text-wrapper' data-fieldset='quoteFS'><label id='form-username-label' for='form-username' data-required='true'>Username</label><input type='text' id='form-username' name='username' required='' placeholder='' aria-labelledby='form-username-label'></div><div class='field-wrapper text-wrapper' data-fieldset='quoteFS'><label id='form-password-label' for='form-password' data-required='true'>Password</label><input type='text' id='form-password' name='password' required='' placeholder='' aria-labelledby='form-password-label'></div><div class='field-wrapper checkbox-wrapper selection-wrapper' data-fieldset=''><input type='checkbox' id='form-loggedin' name='loggedin' placeholder='' value='loggedin' aria-labelledby='form-loggedin-label'><label id='form-loggedin-label' for='form-loggedin'>Keep me logged in</label></div><div class='field-wrapper submit-wrapper' data-fieldset=''><button class='button' type='submit'>submit</button></div></form></div></div></div>",
                        },
                      },
                      {
                        selector: ".form",
                        type: "outerHTML",
                        payload:
                          "<div class='quote'><div><div> <p>The family carousel ride was an unforgettable experience! Our kids loved every moment.</p><p><em><a href='https://en.wikipedia.org/wiki/HTTPS'>See more testimonials</a></em></p> </div> </div> <div><div>Mother of two, <em>Sarah Thompson</em></div> </div> </div>",
                        browser: {
                          selector: "body > main > div:nth-child(7)",
                          payload:
                            "<div class='section light quote-container' style='display: none' data-iddata='valueiddata'> <div class='quote-wrapper'><div class='quote block' data-block-name='quote'><blockquote><div class='quote-quotation'><p>The family carousel ride was an unforgettable experience! Our kids loved every moment.</p><p class='button-container'><em><a href='https://en.wikipedia.org/wiki/HTTPS' title='See more testimonials' class='button secondary'>See more testimonials</a></em></p></div><div class='quote-attribution'><p>Mother of two, <cite>Sarah Thompson</cite></p></div></blockquote></div></div></div>",
                        },
                      },
                      {
                        selector:
                          "main > div > div.carousel > div > div > picture",
                        type: "outerHTML",
                        payload:
                          "<picture style='min-height:420px'><source srcset='https://luma.enablementadobe.com/content/luma/us/en/women/_jcr_content/root/hero_image.coreimg.jpeg' /><img src='https://luma.enablementadobe.com/content/luma/us/en/women/_jcr_content/root/hero_image.coreimg.jpeg'  /></picture>",
                        browser: {
                          selector:
                            "#carousel-1-slide-0 > div.carousel-slide-image picture",
                          type: "innerHTML",
                        },
                      },
                    ],
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

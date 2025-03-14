## PROJECT NAME

NodeJS Client - Target CDN Experimentation NodeJS SDK

## Goals

In this workspace we hold files that are specific to the NodeJS platform.
All the libraries specific to the platform are registered though a singleton store `sdk/src/container.js` and the `TOKENS` object.

In the `Client` we register NodeJS specific libraries:
- logger is using the NodeJS console.log
- http-client is using the NodeJS Fetch API
- crypto is using the NodeJS Crypto API
    - `/sdk-nodejs/src/uuid/rng.js` - we are using `randomFillSync()` method

### Installation

Run `npm run install:all` at the root of the project to install all the dependencies.

### Usage

- `npm run format` - Runs the linter on the project.
- `npm run lint` - Runs the linter on the project.
- `npm run test` - Runs the tests with the coverage enabled. We are using Jest with `--experimental-vm-modules` to support native [ECMA Modules](https://jestjs.io/docs/ecmascript-modules)
- `npm run build` - Builds in `/dist/` the NodeJS Demo project and the Library
- `npm run start` - Starts the demo server


#### Creating the SDK

```javascript
    import { Client } from '@adobe/target-cdn-experimentation-akamai-sdk';
    
    const clientOptions = {
        datastreamId: DATASTREAM_ID, 
        orgId: ORG_ID,
        propertyToken: PROPERTY_TOKEN,
        oddEnabled: true
      };
    const client = await Client(clientOptions);
    
    const reqEvent = {
        "type": "decisioning.propositionFetch",
        "xdm": { ...
        }
    }
    const responseEvent = await client.sendEvent(reqEvent);
    
    // process the response
    const getPropositions = responseEvent.handle.filter((payload) => payload.type === "personalization:decisions")
```

### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

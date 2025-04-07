## Target CDN Experimentation NodeJS SDK

## Goals

This project aims to provide an SDK for Target CDN based experimentation on different CDN environments using AEP endpoints.
The project is structured as a monorepo with the following packages:
- sdk: The main SDK package that provides the core functionality.
- sdk-akamai: The Akamai Edge Worker package that provides the functionality to run the SDK on Akamai Edge Workers.
- sdk-nodejs: The NodeJS package that provides the functionality to run the SDK on NodeJS.

## Features

- Focused on CDN experimentation
- Compatible with Adobe Experience Platform Web SDK API
- Uses Adobe Alloy endpoints


## Non-Goals

- It doesn't provide a full-fledged experimentation library. 
- The client is responsible to interpret and the decisions in their projects.

## Installation

```
npm run install:all
```

## Akamai SDK

All the libraries specific to the platform are registered through a singleton store [Container](sdk/src/container.js) and the `TOKENS` object.

In the `Client` we register Akamai specific libraries:
- [logger](https://techdocs.akamai.com/edgeworkers/docs/log) that is used instead of the NodeJS `console.log`
- [http-request](https://techdocs.akamai.com/edgeworkers/docs/http-request) that is used instead of the NodeJS Fetch API
- [crypto](https://techdocs.akamai.com/edgeworkers/docs/crypto) that is used instead of the NodeJS Crypto API
  - `/sdk-akamai/src/uuid/rng.js` - we are using `crypto.getRandomValues()` instead of the missing NodeJS `randomFillSync()` method
  - `/sdk-akamai/src/md5.js` - we are using a custom library instead of the missing NodeJS `createHash()` method

### Pre-requisites

1) You must setup the Akamai authentication credentials in the `.edgerc` file. You can find the instructions [here](https://techdocs.akamai.com/developer/docs/set-up-authentication-credentials).

2) To use the Akamai SDK you need to have the Akamai CLI installed and configured. You can find the installation instructions [here](https://techdocs.akamai.com/edgeworkers/docs/akamai-cli).
You must install the CLI edgeworker and sandbox packages.

3) Depending on your project update the `sdk-akamai/demo/bundle.json` with the correct starting EdgeWorker version
4) Update the `sdk-akamai/.env` file with the correct EDGEWORKER_ID


### Usage

- `npm run format` - Runs the linter on the project.
- `npm run lint` - Runs the linter on the project.
- `npm run test` - Runs the tests with the coverage enabled. We are using Jest with `--experimental-vm-modules` to support native [ECMA Modules](https://jestjs.io/docs/ecmascript-modules)
- `npm run build` - Builds in `/dist/` the Akamai Demo project and the Library; It will automatically increment the `bundle.json` version and update `EDGEWORKER_VERSION` in the `.env` file
- `npm run edgeworker:deploy` - Deploys the Akamai build to the Akamai network
- `npm run edgeworker:activate` - Activates the build on the Akamai staging network
- `npm run edgeworker:status` - Checks the activation status
- `npm run sandbox:build` - Builds the project for the sandbox server
- `npm run sandbox:start` - Starts the default sandbox server
- `npm run sandbox:deploy` - Deploys the build to the sandbox server


## NodeJS SDK

All the libraries specific to the platform are registered though a singleton store `sdk/src/container.js` and the `TOKENS` object.

In the `Client` we register NodeJS specific libraries:
- logger is using the NodeJS console.log
- http-client is using the NodeJS Fetch API
- crypto is using the NodeJS Crypto API
    - `/sdk-nodejs/src/uuid/rng.js` - we are using `randomFillSync()` method
    - `/sdk-nodejs/src/md5.js` - we are using `createHash()` method

### Installation

Run `npm run install:all` at the root of the project to install all the dependencies.

### Usage

- `npm run format` - Runs the linter on the project.
- `npm run lint` - Runs the linter on the project.
- `npm run test` - Runs the tests with the coverage enabled. We are using Jest with `--experimental-vm-modules` to support native [ECMA Modules](https://jestjs.io/docs/ecmascript-modules)
- `npm run build` - Builds in `/dist/` the NodeJS Demo project and the Library
- `npm run start` - Starts the demo server

### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

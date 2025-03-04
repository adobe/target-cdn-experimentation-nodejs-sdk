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

### Installation

```
npm run install:all
```

### Usage

Browse to the package you want to use and follow the instructions in the README file.


### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

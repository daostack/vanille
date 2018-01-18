# DAOStack Alchemy - Creating DAOs for an Emergent Future

## What is Alchemy?

DAOStack Alchemy is a browser application that enables anyone with an account on the Ethereum blockchain, and STK tokens to spend, to easily create and work with DAOs on Ethereum that run on predefined, configurable smart contracts in a network of organizations, collaborators and investors that collaborate on the blockchain.

## Implementation

The application uses the standards-compliant and highly modular browser-side framework [Aurelia](http://aurelia.io) (hence "Aurelia" in the name of the repository).

Browser-side the application uses TypeScript/ECMAScript 2016+.

At this time there are no web server-side components.

## DaoStack-Arc-Js

Alchemy uses a library of reusable and configurable Ethereum smart contracts called "DaoStack-Arc-Js". You can see all of the source code for those contracts and even contribute to the project [here](https://github.com/daostack/arc-js).

## See It Live

You can browse to the latest release at [http://daostack.azurewebsites.net](http://daostack.azurewebsites.net). This deployment of Alchemy assumes you are either running a Kovan chain locally (listening on localhost:8485), or you are using Chrome and have an extension such as MetaMask that enables you to connect to a Kovan node.

## Build and Run

The file package-scripts.js contains a number of scripts to help you build, run and debug the application.  To build the code, follow these steps:

1. Ensure that [NodeJS](http://nodejs.org/), v8.0.0 or greater, is installed.
2. From the project folder, install the packages:

```shell
  npm install
```

3. Configure arc-js. You only need ever do this once to prepare arc-js to run ganache and migrate contracts to it:

```shell
npm start arc-js.migrateContracts.initialize
```

4. Fire up ganache (testrpc) in a separate window:

```shell
npm start arc-js.ganache.runAsync
```

    If the window didn't fire up in your OS, then run this in a separate window of your own creation:

```shell
npm start arc-js.ganache.run
```

5. Migrate contracts to ganache:

```shell
npm start arc-js.migrateContracts
```

6. build and serve Alchemy:

```shell
  npm start build.development.andServe
```

7. Run Alchemy:

   Browse to: http://localhost:8090/

   If you are using Chrome with Metamask, you will need to disable MetaMask.

## Build and run for production, against kovan:

```shell
  npm start build.production.andServe
```

## Defining Which Chain to Run Against

The "network" environment variable, defined in the developer's OS environment or on the build command line, specifies which blockchain network should be used by the application.

This environment variable is used when migrating contracts from arc-js (see above) and when building the app bundle. The webpack config file obtains the value at build time and pokes it into the app bundle where it is used at runtime.

When deploying to production, we avoid grabbing the wrong chain from the dev environment by hard-coding the desired chain into the NPM command that builds the production version of the app bundle.

## Run against a ganache database

It can be very handy to run against a ganache database that persists the state of the chain across instances of ganache.  The file package-scripts.js contains a number of scripts to help you manage this process.  Most simply, follow ths steps above for building and running the application, except when you bring up ganache, use this script:

 ```shell
npm start arc-js.ganacheDb.runAsync
```

    If the window didn't fire up in your OS, then run this in a separate window of your own creation:

```shell
npm start arc-js.ganacheDb.run
```

## Miscellaneous Notes

* You will find the compiled and bundled javascript in the `dist` folder.

* We use [Webpack](https://webpack.js.org/) for bundling the javascript, html, css and images.

* We use dependency injection where-ever possible, including in the Typescript (client-side).

* Hot Module Reload (HMR) works when built for Development. Build and serve up HMR:

  ```shell
    npm start webpack.build.development.serve
  ```

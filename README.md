# DAOstack Vanille - Creating DAOs for a Collective Intelligence

## What is Vanille?

DAOstack Vanille is a browser application that enables anyone with an account on the Ethereum blockchain, and GEN tokens to spend, to easily create and work with DAOs that run on predefined, configurable smart contracts in a network of organizations, collaborators and investors all collaborating on the blockchain.

## Implementation

The application uses the standards-compliant and highly modular browser-side framework [Aurelia](http://aurelia.io).

Browser-side the application uses TypeScript/ECMAScript 2015 (ES6).

At this time there are no web server-side components.

## DaoStack-Arc.Js

Vanille uses a library of reusable and configurable Ethereum smart contracts called "DaoStack-Arc.Js". You can see all of the source code for those contracts and even contribute to the project [here](https://github.com/daostack/arc.js).

## See It Live

You can browse to the latest release at [http://daostack.azurewebsites.net](http://daostack.azurewebsites.net). This deployment of Vanille assumes you are either running a Kovan chain locally (listening on localhost:8485), or you are using Chrome and have an extension such as MetaMask that enables you to connect to a Kovan node.

## Getting Started

First, ensure that [NodeJS](http://nodejs.org/), v9.0.0 or greater, is installed.

Install all the dependencies:

```shell
npm install
```

Run the following scripts to bring up ganache in a separate window,
migrate Arc contracts to it, build the application, and bring it up in your default browser:


On Windows and MacOS:

```shell
npm install
npm start
```

On Linux and others [until `npm start` is fixed for Linux]:

```shell
npm start arc-js.ganache.run
npm start arc-js.migrateContracts
npm start build.development
npm start browse
```

If running Linux and `npm install` fails with "Error: not found: make", then you need to run `sudo apt-get install build-essential`.

For more information about the scripts involved, see the following section "Build and Run".

## Build and Run

The file package-scripts.js contains a number of scripts to help you build, run and debug the application.  

### Fire up ganache (testrpc) in a separate window

```shell
npm start arc-js.ganache.runAsync
```

Note: If the window didn't fire up in your OS, then run this in a separate window of your own creation:

```shell
npm start arc-js.ganache.run
```

### Migrate contracts to ganache

```shell
npm start arc-js.migrateContracts
```

The "network" environment variable defines which network you are deploying to.  Can be "ganache", "kovan", "ropsten" or "ganache".  The default is "ganache".

### Build and Serve Vanille

```shell
  npm start build.development.andServe
```

If you receive a message relating to sass-loader like "no such file or directory" "node-sass/vendor", run `npm rebuild node-sass`.

### Run Vanille

```shell
  npm start browse
```

or manually browse to: http://localhost:8090/

Note: If you are using Chrome with Metamask, you will need to disable MetaMask.

## Build and Run for Production:

The production build runs against kovan. See "Defining Which Chain to Run Against".

```shell
  npm start build.production.andServe
```

## Defining Which Chain to Run Against

The "network" environment variable, defined in the developer's OS environment or on the build command line, specifies which blockchain network should be used by the application.

This environment variable is used when migrating contracts from Arc.js (see above) and when building the app bundle. The webpack config file obtains the value at build time and pokes it into the app bundle where it is used at runtime.

When deploying to production, we avoid grabbing the wrong chain from the dev environment by hard-coding the desired chain into the NPM command that builds the production version of the app bundle.  But when migrating, you must set the network environment variable.

## Run against a Ganache Database

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

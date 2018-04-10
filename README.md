[![Build Status](https://api.travis-ci.org/daostack/vanille.svg?branch=master)](https://travis-ci.org/daostack/vanille)

# DAOstack Vanille

## Introduction

[@DAOstack/Vanille](https://github.com/daostack/vanille) is a browser application that provides a GUI dashboard for all of the "wrapped" [@DAOstack/Arc](https://github.com/daostack/arc.js) contracts in [@DAOStack/Arc.Js](https://github.com/daostack/arc.js), plus the ability to create DAOs in the [DAOstack stack](https://daostack.io).

You can see all of the source code for Vanille and even contribute to the project [here](https://github.com/daostack/vanille).

## Implementation
Vanille uses the standards-compliant and highly modular browser-side framework [Aurelia](http://aurelia.io).

Browser-side the application uses TypeScript/ECMAScript 2015 (ES6).

At this time there are no web server-side components.

You will find the compiled and bundled javascript in the `dist` folder.

We use [Webpack](https://webpack.js.org/) for bundling the javascript, html, css and images.

## Use Vanille Now

The latest live Vanille release is running at [http://daostack.azurewebsites.net](http://daostack.azurewebsites.net). This deployment of Vanille assumes you are either running a Kovan chain locally (listening on localhost:8547), or you are using Chrome and have an extension such as MetaMask that enables you to connect to a Kovan node.

## Run Vanille Locally

The following instructions are for when you want to run Vanille locally.  Assuming you have already cloned the [Vanille repository](https://github.com/daostack/vanille):

Ensure that [NodeJS](https://nodejs.org/), v9.4.0 or greater, is installed.

Install all the dependencies:

```shell
npm install
```

In a separate shell window, start ganache:

```script
npm start arc-js.ganache.run
```

Migrate the Arc contracts to Ganache:

```script
npm start arc-js.migrateContracts
```

Build the application for development:

```script
npm start build.development
```

Run the application:

```shell
npm start browse
```

or manually browse to: http://localhost:8090/

**Note**: If you are using Chrome with Metamask, you will need to disable MetaMask or else point it to your local computer.

<a name="whichChain"></a>
## Migrate to a Different Testnet

The `arcjs_network` environment variable, defined in the developer's OS environment or on the build command line, specifies which blockchain network should be used by the application. Can be "ganache", "kovan", "ropsten" or "ganache".  The default is "ganache".

This environment variable is used when migrating contracts from Arc.js and when building the app bundle. The webpack config file obtains the value at build time and pokes it into the app bundle where it is used at runtime.

When deploying to production, we avoid grabbing the wrong chain from the dev environment by hard-coding the desired chain into the [NPM command that builds the production version of the app bundle](README#production).  But when migrating, you must set the network environment variable yourself.

See more about migration, including how to set the right network node url and port numbers, in the [Arc.js documentation about migration](https://daostack.github.io/arc.js/Migration/).

## Build and Serve Vanille for Debugging with Hot Module Replacement

```shell
  npm start build.development.andServe
```

**Note**: If you are using Chrome with Metamask, you will need to disable MetaMask or else point it to your local computer.

<a name="production"></a>
## Build and Run for Production

The production build runs against kovan. See [Migrate to a Different Testnet](README#whichChain).

```shell
  npm start build.production.andServe
```

## More Scripts

- All of the Arc.js scripts are available to you. See the [Arc.js documentation](https://daostack.github.io/arc.js/Scripts)

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

The latest live Vanille release is running at [http://daostack.azurewebsites.net](http://daostack.azurewebsites.net). This deployment of Vanille assumes you are either running a node locally at http://127.0.0.1:8545 or you are using Chrome with an extension such as MetaMask that enables you to connect the chain of your choice.

## Run Vanille Locally

The following instructions are for when you want to run Vanille locally.  Assuming you have already cloned the [Vanille repository](https://github.com/daostack/vanille):

Ensure that [NodeJS](https://nodejs.org/), v9.4.0 or greater, is installed.

Install all the dependencies:

```shell
npm install
```

In a separate shell window, start ganache:

```script
npm start arc-js.ganache
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
## Migrate Contracts to a Testnet

The script `npm start arc-js.migrateContracts` (see above) uses environment variables to govern its behavior.
including setting the network node url and port numbers, and locking an account using a mnemonic.  Read the Arc.js documentation for more information:  https://daostack.github.io/arc.js/Migration/ and https://daostack.github.io/arc.js/Configuration/.

If you want Vanille to connect to a local node that is not listening at the default http://127.0.0.1:8545, then you can set the `arcjs_network` environment variable at build time (either in the OS or on the build command line) and webpack will poke the value into the app bundle where it is used at runtime to tell Arc.js which default url and port values to use to connect to a node.


## Build and Serve Vanille for Debugging with Hot Module Replacement

```shell
  npm start build.development.andServe
```

**Note**: If you are using Chrome with Metamask, you will need to disable MetaMask or else point it to your local computer.

<a name="production"></a>
## Build and Run for Production

See [Migrate to a Different Testnet](README#whichChain).

```shell
  npm start build.production.andServe
```

## More Scripts

- All of the Arc.js scripts are available to you. See the [Arc.js documentation](https://daostack.github.io/arc.js/Scripts)

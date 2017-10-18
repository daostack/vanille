# DAOStack Alchemy - Creating DAOs for an Emergent Future

## What is Alchemy?

The DAOStack Alchemy is a browser application that enables anyone with an account on the Ethereum blockchain, and \[STK?\] tokens to spend, to easily create DAOs on Ethereum that run on predefined, configurable smart contracts.

## Implementation
The application uses the standards-compliant and highly modular browser-side framework [Aurelia](http://aurelia.io) (hence "Aurelia" in the name of the repository).

Browser-side the application uses TypeScript/ECMAScript 2016+.  At this time there are no web server-side components.

## The DAOStack

Alchemy depends on a library of reusable and configurable Ethereum smart contracts called "DAOStack".  You can see all of the source code for those contracts and even contribute to the project [here](https://github.com/daostack/daostack).

## See It Live
You will soon be able to  browse to the latest release at [http://daostack.azurewebsites.net](http://daostack.azurewebsites.net).  This deployment of the DAOStack application assumes you are either running a Kovan chain locally (listening on localhost:8485), or you are using Chrome and have an extension such as MetaMask that enables you to connect to a Kovan node.

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed.
2. From the project folder, install the packages:

  ```shell
    npm install
  ```
3. build the application:
  ```shell
    npm start webpack.build.development
  ```

4. start the application:
  ```shell
    npm start serve
  ```

## Defining Which Chain to Run Against

The ETH_ENV environment variable, as defined in the developer's OS environment, specifies which blockchain network should be used by the application.

The variable is only used when building the app bundle. The webpack config file obtains the value at build time and pokes it into the app bundle where it can be used at runtime.

The OS environment value can be overridden on the command where you build the app bundle, using either `cross-env` or the node `env` command-line parameter.  However, when the bundle is being built by Hot Module Reload (HMR), the node `env` command-line parameter is not available. Thus for HMR, if you want to use the command line to override the OS environment setting, you can only use `cross-env`. Note that being HMR, this is only relevant to dev environments.

When deploying to production, to avoid grabbing the wrong chain from the dev environment, we hard-code the desired chain into the command that builds the production version of the app bundle, defined in the .csproj file.

## Miscellaneous Notes

* You will find the compiled and bundled javascript in the `dist` folder.

* We use [Webpack](https://webpack.js.org/) for bundling the javascript, html, css and images.

* Client-side content is contained in two bundles, one containing "app" code and the other containing "vendor" code, basically all the application dependencies.  There is one webpack config file for each bundle.  The bundles are minified and uglified when built for production.

* We use dependency injection where-ever possible, including in the Typescript (client-side).

* Hot Module Reload (HMR) works when built for Development:

  ```shell
    npm start webpack.build.development.serve
  ```

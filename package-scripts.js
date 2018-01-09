const {
  series,
  crossEnv,
  concurrent,
  rimraf,
  runInNewWindow
} = require("nps-utils");
const { config: { port: E2E_PORT } } = require("./test/protractor.conf");
const env = require("env-variable")();
const joinPath = require("path.join");
const cwd = require("cwd")();

const alchemyRoot = env.alchemyRoot || cwd;
const pathArcJs =
  env.pathArcJs || joinPath(alchemyRoot, "node_modules/daostack-arc-js");
// const pathArcJsDaostackArc =
//   env.pathArcJsDaostackArc || joinPath(pathArcJs, "node_modules/daostack-arc");
const network = env.ETH_ENV;

module.exports = {
  scripts: {
    default: "nps webpack",
    "arc-js": {
      /**
       * Setup daostack-arc-js for the first time after installing it.
       *
       * You must run this before you can run anything else, but you need only do it once.
       * daostack-arc-js expects to find daostack-arc underneath it in the mode_modules package folder structure.
       */
      initialize: series(
        `cd ${pathArcJs}`,
        "npm start migrateContracts.initialize",
        `cd ${alchemyRoot}`
      ),
      /**
       * Run testrpc with parameters given by daostack-arc-js.
       *
       * Before you do anything, just for the first time, run "npm start arc-js.initialize".
       */
      ganache: {
        run: series(
          `cd ${pathArcJs}`,
          "npm start test.ganache.run",
          `cd ${alchemyRoot}`
        ),
        runAsync: series(
          `cd ${pathArcJs}`,
          "npm start test.ganache.runAsync",
          `cd ${alchemyRoot}`
        )
      },
      /**
       * Migrate contracts using daostack-arc-js.
       *
       * Before you do anything, just for the first time:
       *
       *    npm start arc-js.initialize
       *
       * Then fire up ganache (testrpc) in a separate window.
       *
       *    npm start arc-js.ganache.runAsync
       *
       * If the window didn't fire up in your OS, then run this
       * in a separate window of your own creation:
       *
       *    npm start test.ganache.run
       *
       * Then run the migrations:
       *
       *    npm start arc-js.migrateContracts
       *
       * Now build and run the application:
       *
       *    npm start build.production.andServe
       *
       * If you want to migrate to another network, kovan for example:
       *
       *  Set the environment variable ETH_ENV to "kovan"
       *  Start a local network node listening at http://127.0.0.1:8584
       *  Run:  npm start migrateContracts
       *
       * To deploy to the mainnet, Set the environment variable ETH_ENV to "live" and proceed as above.
       */
      migrateContracts: {
        /**
         * Migrate contracts.
         * Truffle will merge your migration into whatever previous ones are already present.
         */
        default: series(
          `cd ${pathArcJs}`,
          `npm start migrateContracts.andFetch`,
          `cd ${alchemyRoot}`
        ),
        /**
         * Clean, optionally with migration.
         *
         * IMPORTANT! Only do this if you aren't worried about losing
         * previously-performed migrations to other networks.  By cleaning, you'll lose them, starting
         * from scratch.  Otherwise, truffle will merge your migrations into whatever previous
         * ones exist.
         */
        clean: series(
          `cd ${pathArcJs}`,
          `npm start migrateContracts.clean`,
          `cd ${alchemyRoot}`,
          `npm start arc-js.migrateContracts`
        )
      },
      ganacheDb: {
        /**
         * ganacheDb scripts are handy for doing development against ganache, enabling you to
         * take a snapshot (the database of the chain at any point, such as right after migration,
         * and easily reuse it.
         *
         * Follow these steps to set up the database:
         *
         * This can take a long time as there may be thousands of files to delete:
         *
         *    npm start arc-js.ganacheDb.clean
         *
         * The following will open a window with ganache running in it:
         *
         *    npm start arc-js.ganacheDb.runAsync
         *
         * This will migrate the contracts and pull them into the project where they need to be:
         *
         *    npm start arc-js.migrateContracts.andFetch
         *
         * Now zip database for later reuse.
         * But first you must close the window in which ganache is running.
         * (You must do this yourself, in your OS.)
         *
         *    npm start arc-js.ganacheDb.zip
         *
         * Now you can restart ganache against the new database:
         *
         *    npm start arc-js.ganacheDb.runAsync
         */
        run: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.run`,
          `cd ${alchemyRoot}`
        ),
        runAsync: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.runAsync`,
          `cd ${alchemyRoot}`
        ),
        clean: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.clean`,
          `cd ${alchemyRoot}`
        ),
        zip: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.zip`,
          `cd ${alchemyRoot}`
        ),
        unzip: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.unzip`,
          `cd ${alchemyRoot}`
        ),
        restoreFromZip: series(
          `cd ${pathArcJs}`,
          `npm start test.ganacheDb.restoreFromZip`,
          `cd ${alchemyRoot}`
        )
      }
    },
    test: {
      default: "nps test.jest",
      jest: {
        default: "jest",
        coverage: rimraf("test/coverage-jest"),
        accept: "jest -u",
        watch: "jest --watch"
      },
      karma: {
        default: series(
          rimraf("test/coverage-karma"),
          "karma start test/karma.conf.js"
        ),
        watch: "karma start test/karma.conf.js --auto-watch --no-single-run",
        debug:
          "karma start test/karma.conf.js --auto-watch --no-single-run --debug"
      },
      all: concurrent({
        browser: series.nps("test.karma", "e2e"),
        jest: "nps test.jest"
      })
    },
    e2e: {
      default:
        concurrent({
          webpack: `webpack-dev-server --inline --port=${E2E_PORT}`,
          protractor: "nps e2e.whenReady"
        }) + " --kill-others --success first",
      protractor: {
        install: "webdriver-manager update",
        default: series(
          "nps e2e.protractor.install",
          "protractor test/protractor.conf.js"
        ),
        debug: series(
          "nps e2e.protractor.install",
          "protractor test/protractor.conf.js --elementExplorer"
        )
      },
      whenReady: series(
        `wait-on --timeout 120000 http-get://localhost:${E2E_PORT}/index.html`,
        "nps e2e.protractor"
      )
    },
    build: {
      production: {
        default: "nps webpack.build.production",
        andServe: "nps webpack.build.production.serve"
      },
      development: {
        default: "nps webpack.build.development",
        andServe: "nps webpack.build.development.serve"
      }
    },
    webpack: {
      default: "nps webpack.server",
      build: {
        before: rimraf("dist"),
        default: "nps webpack.build.production",
        development: {
          default: series("nps webpack.build.before", "webpack --progress -d"),
          extractCss: series(
            "nps webpack.build.before",
            "webpack --progress -d --env.extractCss"
          ),
          serve: series.nps("webpack.build.development", "webpack.server.hmr")
        },
        production: {
          inlineCss: series(
            "nps webpack.build.before",
            /* removed -p because UglifyJs barfs on the ES6 code in daostack-arc-js */
            "webpack --progress --env.production --env.ETH_ENV=kovan"
          ),
          default: series(
            "nps webpack.build.before",
            /* removed -p because UglifyJs barfs on the ES6 code in daostack-arc-js */
            "webpack --progress --env.production --env.extractCss --env.ETH_ENV=kovan"
          ),
          serve: series.nps("webpack.build.production", "serve")
        }
      },
      server: {
        default: `webpack-dev-server -d --inline --env.server --port 8090`,
        extractCss: `webpack-dev-server -d --inline --env.server --env.extractCss --port 8090`,
        hmr: `webpack-dev-server -d --inline --hot --env.server --port 8090`
      }
    },
    hmr: "nps webpack.server.hmr",
    serve: "http-server dist --cors -o -p 8090"
  }
};

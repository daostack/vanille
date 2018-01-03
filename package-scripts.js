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
      testrpc: {
        run: series(
          `cd ${pathArcJs}`,
          "npm start test.testrpc.run",
          `cd ${alchemyRoot}`
        ),
        runAsync: series(
          `cd ${pathArcJs}`,
          "npm start test.testrpc.runAsync",
          `cd ${alchemyRoot}`
        )
      },
      /**
       * Migrate contracts using daostack-arc-js.
       *
       * Before you do anything, just for the first time:
       *
       *  npm start arc-js.initialize
       *
       * Typical workflow you want to migrate contracts to testrpc:
       *
       *  npm start arc-js.testrpc.runAsync
       *  npm start arc-js.migrateContracts
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
      }
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
    build: "nps webpack.build",
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

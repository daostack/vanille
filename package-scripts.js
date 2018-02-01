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

const vanilleRoot = env.vanilleRoot || cwd;
const pathArcJs =
  env.pathArcJs || joinPath(vanilleRoot, "node_modules/daostack-arc-js");
const network = env.network;

module.exports = {
  scripts: {
    default: series(
      "nps arc-js.ganache.runAsync",
      "nps arc-js.migrateContracts",
      "nps build.development",
      "nps browse"
    ),
    /**
     * Migrate contracts using daostack-arc.js.  For usage, see this readme.md, the 
     * daostack-arc.js readme.md and its package-scripts.js.
     */
    "arc-js": {
      ganache: {
        run: "npm explore daostack-arc-js -- npm start test.ganache.run",
        runAsync: "npm explore daostack-arc-js -- npm start test.ganache.runAsync"
      },
      ganacheDb: {
        run: "npm explore daostack-arc-js -- npm start test.ganacheDb.run",
        runAsync: "npm explore daostack-arc-js -- npm start test.ganacheDb.runAsync",
        clean: "npm explore daostack-arc-js -- npm start test.ganacheDb.clean",
        zip: "npm explore daostack-arc-js -- npm start test.ganacheDb.zip",
        unzip: "npm explore daostack-arc-js -- npm start test.ganacheDb.unzip",
        restoreFromZip: "npm explore daostack-arc-js -- npm start test.ganacheDb.restoreFromZip"
      },
      migrateContracts: "npm explore daostack-arc-js -- npm start migrateContracts"
    },
    test: {
      default: "nps test.jest",
      jest: {
        default: "jest",
        coverage: rimraf("test/coverage-jest"),
        accept: "jest -u",
        watch: "jest --watch",
        updateSnapshots: "jest --updateSnapshot"
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
        andServe: "nps webpack.build.production.andServe"
      },
      development: {
        default: "nps webpack.build.development",
        andServe: "nps webpack.build.development.andServe"
      }
    },
    webpack: {
      build: {
        before: rimraf("dist"),
        default: "nps webpack.build.production",
        development: {
          default: series(
            "nps webpack.build.before",
            "webpack --progress -d"),
          extractCss: series(
            "nps webpack.build.before",
            "webpack --progress -d --env.extractCss"
          ),
          // doesn't use the dist folder
          andServe: `webpack-dev-server -d --inline --hot --env.server --port 8090`
        },
        production: {
          default: series(
            "nps webpack.build.before",
            "webpack --progress --env.production --env.extractCss --env.network=kovan"
          ),
          inlineCss: series(
            "nps webpack.build.before",
            "webpack --progress --env.production --env.network=kovan"
          ),
          andServe: series(
            "nps webpack.build.production",
            "nps browse")
        }
      }
    },
    hmr: "nps build.development.andServe",
    browse: "http-server dist --cors -o -p 8090"
  }
};

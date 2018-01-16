const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack');
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || []
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig)

// primary config:
const title = 'DAOStack Alchemy';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const cssRules = [
  { loader: 'css-loader' },
  {
    loader: 'postcss-loader',
    options: { plugins: () => [require('autoprefixer')({ browsers: ['last 2 versions'] })] }
  }
]

const scssRules = [...cssRules,
{
  loader: "sass-loader" // compiles Sass to CSS
}];

/**
 * @return {webpack.Configuration}
 */
module.exports = ({ production, server, extractCss, coverage, ETH_ENV } = {}) => {

  let ENV = production ? 'production' : 'development';

  // also taking from OS environment which is the only way I've found to supply it when when needed by HMR
  ETH_ENV = ETH_ENV || process.env.ETH_ENV || 'testrpc';

  console.log(`ENV: ${ENV}`);
  console.log(`ETH_ENV: ${ETH_ENV}`);

  return {

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [srcDir, 'node_modules'],
      alias: {
        // prepend '~' to import path in order to use this alias
        // "bootstrap-sass": path.resolve(nodeModulesDir,"bootstrap/scss/"),
        // "mdbootstrap-sass": path.resolve(nodeModulesDir,"mdbootstrap/sass/mdb/free/"),
        "bootstrap": path.resolve(nodeModulesDir, "bootstrap/"),
        "BMD": path.resolve(nodeModulesDir, "bootstrap-material-design/scss/"),
        "static": path.resolve(__dirname, "static"),
      }
    },

    devtool: production ? 'source-map' : 'cheap-module-eval-source-map',
    entry: {
      app: ['aurelia-bootstrapper'],
      vendor: [
        'bluebird',
        'daostack-arc-js',
        'ethereumjs-tx',
        'truffle-contract'
      ],
    },
    output: {
      path: outDir,
      publicPath: baseUrl,
      filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
      sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
      chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js',
    },
    devServer: {
      contentBase: outDir,
      // serve index.html for all 404 (required for push-state)
      historyApiFallback: true,
    },
    // to avoid errors when arc-js pulls in nconf
    // target: 'node',
    // to avoid errors when arc-js pulls in nconf
    node: {
      fs: "empty"
      , child_process: "empty"
    },
    module: {
      rules: [
        // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
        // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
        {
          test: /\.scss$/i,
          issuer: [{ not: [{ test: /\.html$/i }] }],
          use: extractCss ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: scssRules,
          }) : ['style-loader', ...scssRules],
        },
        {
          test: /\.scss$/i,
          issuer: [{ test: /\.html$/i }],
          // CSS required in templates cannot be extracted safely
          // because Aurelia would try to require it again in runtime
          use: scssRules,
        },
        {
          test: /\.css$/i,
          issuer: [{ not: [{ test: /\.html$/i }] }],
          use: extractCss ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: cssRules,
          }) : ['style-loader', ...cssRules],
        },
        {
          test: /\.css$/i,
          issuer: [{ test: /\.html$/i }],
          // CSS required in templates cannot be extracted safely
          // because Aurelia would try to require it again in runtime
          use: cssRules,
        },
        { test: /\.html$/i, loader: 'html-loader' },
        { test: /\.ts$/i, loader: 'awesome-typescript-loader', exclude: nodeModulesDir },
        { test: /\.json$/i, loader: 'json-loader' },
        // use Bluebird as the global Promise implementation:
        { test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
        // exposes jQuery globally as $ and as jQuery:
        { test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery' },
        // embed small images and fonts as Data Urls and larger ones as files:
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        // load these fonts normally, as files:
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
        ...when(coverage, {
          test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
          include: srcDir, exclude: [/\.{spec,test}\.[jt]s$/i],
          enforce: 'post', options: { esModules: true },
        })
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          ENV: JSON.stringify(ENV),
          ETH_ENV: JSON.stringify(ETH_ENV),
        },
      }),
      new AureliaPlugin(),
      new ProvidePlugin({
        Promise: 'bluebird',
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default'],
        Waves: 'node-waves'
      }),
      new TsConfigPathsPlugin(),
      new CheckerPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.ejs',
        minify: production ? {
          removeComments: true,
          collapseWhitespace: true
        } : undefined,
        metadata: {
          // available in index.ejs //
          title, server, baseUrl
        },
      }),
      new CopyWebpackPlugin([
        { from: 'static/favicon.ico' },
        { from: 'node_modules/font-awesome/fonts', to: 'fonts' },
        { from: 'node_modules/font-awesome/css/font-awesome.min.css', to: 'font-awesome.min.css' },
        { from: 'node_modules/snackbarjs/dist/snackbar.min.css' },
        { from: 'node_modules/bootstrap-material-design/dist/css/bootstrap-material-design.min.css' },
        // for the spash page
        { from: 'static/base.css' },
      ]),
      ...when(extractCss, new ExtractTextPlugin({
        filename: production ? '[contenthash].css' : '[id].css',
        allChunks: true,
      })),
      ...when(!production, [
        new webpack.SourceMapDevToolPlugin({
          filename: '[file].map', // Remove this line if you prefer inline source maps
          moduleFilenameTemplate: path.relative(outDir, '[resourcePath]')  // Point sourcemap entries to the original file locations on disk
        }),
      ]),
      ...when(production, [
        new CommonsChunkPlugin({
          name: 'common'
        })
      ])
      // , new BundleAnalyzerPlugin({ analyzerMode: 'static' })
    ],
  }
}

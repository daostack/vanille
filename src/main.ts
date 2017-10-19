/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
import '../static/styles.css';
import 'font-awesome/css/font-awesome.css';
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import 'jquery';
import 'materialize-css';
import { ArcService } from "./services/ArcService";
import { Web3Service } from "./services/Web3Service";
import  { configure as configureEmergentArc } from 'emergent-arc';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

// supplied by Webpack
export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration();

  if (process.env.ENV == "development") {
      aurelia.use.developmentLogging();
  }    

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  aurelia.use.globalResources([
    PLATFORM.moduleName("resources/customElements/EtherscanLink/EtherscanLink"),
    PLATFORM.moduleName("resources/customElements/EthBalance/EthBalance"),
    PLATFORM.moduleName("resources/customElements/TokenTicker/TokenTicker"),
    PLATFORM.moduleName("resources/customElements/FaucetButton/FaucetButton"),
    PLATFORM.moduleName("resources/valueConverters/toUpper")
  ]);

  await aurelia.start();

  try {

    const web3 = configureEmergentArc({
      /**
       * EmergentArc must be initialized prior to 
       * ETH_ENV is supplied by webpack.
       * Arc isn't actually using this, but I'm sending it anyways, because I can :-)
       */ 
      network : { name: process.env.ETH_ENV }
    });
  
    await Web3Service.initialize(web3);
  
    await ArcService.initialize();

  } catch(ex) {
    console.log(`Error initializing blockchain services: ${ex}`)
  }

  await aurelia.setRoot(PLATFORM.moduleName('app'));
}

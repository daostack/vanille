import { ArcService } from './services/ArcService';
/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
import { Aurelia } from 'aurelia-framework';
import { OrganizationService } from './services/OrganizationService';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import { Web3Service } from "./services/Web3Service";
import  { configure as configureEmergentArc } from 'emergent-arc';
import { VotingMachineService } from  "./services/VotingMachineService";

import 'arrive'; // do bmd does it's thing whenever views are attached
import 'bootstrap-material-design';
import { SnackbarService } from "./services/SnackbarService";

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
    PLATFORM.moduleName("resources/customElements/ArcSchemesDropdown/arcSchemesDropdown"),
    PLATFORM.moduleName("resources/customElements/VotingMachinesDropdown/votingMachinesDropdown"),
    PLATFORM.moduleName("resources/customElements/GlobalConstraintsDropdown/globalConstraintsDropdown"),
    PLATFORM.moduleName("resources/customElements/TokenTicker/TokenTicker"),
    PLATFORM.moduleName("resources/customElements/FaucetButton/FaucetButton"),
    PLATFORM.moduleName("resources/customElements/round-add-button.html"),
    PLATFORM.moduleName("resources/customElements/round-remove-button.html"),
    PLATFORM.moduleName("resources/customElements/round-trash-button.html"),
    PLATFORM.moduleName("resources/customElements/round-dashboard-button.html"),
    PLATFORM.moduleName("resources/customElements/instructions.html"),
    PLATFORM.moduleName("resources/customAttributes/click-to-route"),
    PLATFORM.moduleName("resources/customAttributes/blur-image"),
    PLATFORM.moduleName("resources/valueConverters/toUpper"),
  ]);


    
  PLATFORM.moduleName("./schemeDashboards/GlobalConstraintRegistrar")
  PLATFORM.moduleName("./schemeDashboards/NonArc")
  PLATFORM.moduleName("./schemeDashboards/NotRegistered")
  PLATFORM.moduleName("./schemeDashboards/SchemeRegistrar")
  PLATFORM.moduleName("./schemeDashboards/SimpleContributionScheme")
  PLATFORM.moduleName("./schemeDashboards/UpgradeScheme")

  PLATFORM.moduleName("./schemeConfiguration/SimpleContributionScheme")
  PLATFORM.moduleName("./schemeConfiguration/GlobalConstraintRegistrar")
  PLATFORM.moduleName("./schemeConfiguration/UpgradeScheme")
  PLATFORM.moduleName("./schemeConfiguration/SchemeRegistrar")

  PLATFORM.moduleName("./votingMachineConfiguration/AbsoluteVote")
  PLATFORM.moduleName("./globalConstraintConfiguration/TokenCapGC")
    
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
  
    // just to initialize it and get it running
    aurelia.container.get(SnackbarService);
    
    const web3Service = new Web3Service();
    await web3Service.initialize(web3);
    aurelia.container.registerSingleton(Web3Service, () => {
      return web3Service;
    });

    const arcService = new ArcService();
    await arcService.initialize();
    aurelia.container.registerSingleton(ArcService, () => {
      return arcService;
    });

    const orgService = new OrganizationService(arcService, web3Service);
    await orgService.initialize();
    aurelia.container.registerSingleton(OrganizationService, () => {
      return orgService;
    });

  } catch(ex) {
    console.log(`Error initializing blockchain services: ${ex}`)
  }

  await aurelia.setRoot(PLATFORM.moduleName('app'));
}

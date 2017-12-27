import { ArcService } from './services/ArcService';
/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
import { Aurelia } from 'aurelia-framework';
import { OrganizationService } from './services/OrganizationService';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import { Web3Service } from "./services/Web3Service";
import  { configure as configureDAOstackArc } from 'daostack-arc-js';
import { OrganizationsList } from  "./organizations/list";

import 'arrive'; // do bmd does it's thing whenever views are attached
import "popper.js";
import 'bootstrap-material-design';
import { SnackbarService } from "./services/SnackbarService";
import { ConsoleLogService } from "./services/ConsoleLogService";

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

// supplied by Webpack
export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration();

  // for now, always on for trouble-shooting:  if (process.env.ENV == "development") {
      aurelia.use.developmentLogging();
  // }

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  aurelia.use.globalResources([
    PLATFORM.moduleName("resources/customElements/EtherscanLink/EtherscanLink"),
    PLATFORM.moduleName("resources/customElements/EthBalance/EthBalance"),
    PLATFORM.moduleName("resources/customElements/UsersAddress/UsersAddress"),
    PLATFORM.moduleName("resources/customElements/arcSchemesDropdown/arcSchemesDropdown"),
    PLATFORM.moduleName("resources/customElements/VotingMachinesDropdown/votingMachinesDropdown"),
    PLATFORM.moduleName("resources/customElements/GlobalConstraintsDropdown/globalConstraintsDropdown"),
    PLATFORM.moduleName("resources/customElements/TokenTicker/TokenTicker"),
    PLATFORM.moduleName("resources/customElements/FaucetButton/FaucetButton"),
    PLATFORM.moduleName("resources/customElements/round-add-button.html"),
    PLATFORM.moduleName("resources/customElements/round-remove-button.html"),
    PLATFORM.moduleName("resources/customElements/round-trash-button.html"),
    PLATFORM.moduleName("resources/customElements/round-dashboard-button.html"),
    PLATFORM.moduleName("resources/customElements/copyToClipboardButton/copyToClipboardButton"),
    PLATFORM.moduleName("resources/customElements/instructions.html"),
    PLATFORM.moduleName("resources/customElements/pageLoading.html"),
    PLATFORM.moduleName("resources/customAttributes/click-to-route"),
    PLATFORM.moduleName("resources/customAttributes/blur-image"),
    PLATFORM.moduleName("resources/valueConverters/toUpper"),
    PLATFORM.moduleName("resources/valueConverters/number"),
    PLATFORM.moduleName("resources/valueConverters/round"),
    PLATFORM.moduleName("resources/valueConverters/ethwei"),
    PLATFORM.moduleName("schemeDashboards/SchemeChangeFees.html"),
    PLATFORM.moduleName("schemeConfiguration/VotingMachineSelector"),
    PLATFORM.moduleName("footer.html"),
    PLATFORM.moduleName("header.html")
  ]);


    
  PLATFORM.moduleName("./schemeDashboards/GlobalConstraintRegistrar")
  PLATFORM.moduleName("./schemeDashboards/NonArc")
  PLATFORM.moduleName("./schemeDashboards/NotRegistered")
  PLATFORM.moduleName("./schemeDashboards/SchemeRegistrar")
  PLATFORM.moduleName("./schemeDashboards/ContributionReward")
  PLATFORM.moduleName("./schemeDashboards/UpgradeScheme")

  PLATFORM.moduleName("./schemeConfiguration/ContributionReward")
  PLATFORM.moduleName("./schemeConfiguration/GlobalConstraintRegistrar")
  PLATFORM.moduleName("./schemeConfiguration/UpgradeScheme")
  PLATFORM.moduleName("./schemeConfiguration/SchemeRegistrar")
  PLATFORM.moduleName("./schemeConfiguration/NonArcScheme")

  PLATFORM.moduleName("./votingMachineConfiguration/AbsoluteVote")
  PLATFORM.moduleName("./globalConstraintConfiguration/TokenCapGC")
    
  await aurelia.start();

  try {

    const web3 = configureDAOstackArc({
      /**
       * EmergentArc must be initialized prior to arcService being loaded
       * ETH_ENV is supplied by webpack.
       * Arc isn't actually using 'network', but I'm sending it anyways, because I can :-)
       */ 
      network : { name: process.env.ETH_ENV }
    });
  
    // just to initialize them and get them running
    aurelia.container.get(ConsoleLogService);
    aurelia.container.get(SnackbarService);
    aurelia.container.get(OrganizationsList);
    
    const web3Service = aurelia.container.get(Web3Service);
    await web3Service.initialize(web3);
    // aurelia.container.registerSingleton(Web3Service, () => {
    //   return web3Service;
    // });

    const arcService = aurelia.container.get(ArcService);
    await arcService.initialize();
    // aurelia.container.registerSingleton(ArcService, () => {
    //   return arcService;
    // });

    const orgService = aurelia.container.get(OrganizationService);
    // don't await here, for faster application GUI load time
    orgService.initialize();
    // aurelia.container.registerSingleton(OrganizationService, () => {
    //   return orgService;
    // });

  } catch(ex) {
    console.log(`Error initializing blockchain services: ${ex}`);
    alert(`Error initializing blockchain services: ${ex}`);
  }

  await aurelia.setRoot(PLATFORM.moduleName('app'));
}

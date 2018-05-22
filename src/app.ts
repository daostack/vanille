import { Aurelia, autoinject, LogManager } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';
import { Web3Service } from "./services/Web3Service";
import { ArcService } from "./services/ArcService";
import '../static/styles.scss';

@autoinject
export class App {
  router: Router;
  private isConnected: boolean;
  private logger = LogManager.getLogger("Vanille");
  private healthy: boolean = false;
  private network = Web3Service.Network;

  constructor(
    private web3: Web3Service,
    private arcService: ArcService
  ) {
  }

  attached() {
    (<any>$('body')).bootstrapMaterialDesign({ global: { label: { className: "bmd-label-floating" } } });
  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.title = 'DAOstack Vanille';
    /**
     * can be connected 
     */
    const haveDAOstack = !!this.arcService.arcContracts;
    const isConnected = this.web3.isConnected;
    const isCorrectChain = this.web3.isCorrectChain;
    const noAccount = !this.web3.defaultAccount;

    this.isConnected = isConnected && isCorrectChain && haveDAOstack;

    /**
     * first set the landing page.
     * it is possible to be connected but have the wrong chain.
     */
    if (isConnected && noAccount) {
      config.map([
        {
          route: [''],
          name: 'noaccount',
          moduleId: PLATFORM.moduleName('./error-pages/noaccount/noaccount'),
          nav: false,
          title: 'No Account'
        }]);
    }
    else if (isConnected && !isCorrectChain) {
      config.map([
        {
          route: [''],
          name: 'wrongchain',
          moduleId: PLATFORM.moduleName('./error-pages/wrongchain/wrongchain'),
          nav: false,
          title: 'Wrong Chain'
        }]);
    }
    /**
     * not connected and/or couldn't get the daostack addresses, either way treat as not connected
     */
    else if (!haveDAOstack) {
      this.logger.error(`contracts not found`);
      config.map([
        {
          route: [''],
          name: 'notconnected',
          moduleId: PLATFORM.moduleName('./error-pages/notconnected/notconnected'),
          nav: false,
          title: 'Not Connected'
        }]);
    }
    else {
      config.map([
        { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./home'), nav: false, title: 'Home' }
        , {
          route: ['organizations'],
          name: 'organizations',
          moduleId: PLATFORM.moduleName('./organizations/list'),
          nav: true,
          title: 'DAOstack Ecosystem'
        }
        , {
          route: ['deployDAO'],
          name: 'deployDAO',
          moduleId: PLATFORM.moduleName('./organizations/deploy'),
          nav: true,
          title: 'Birth a DAO'
        }
        , {
          // 'address' will be present in the object passed to the 'activate' method of the viewmodel
          route: ['daoDashboard/:address'],
          name: 'daoDashboard',
          moduleId: PLATFORM.moduleName('./organizations/dashboard'),
          nav: false,
          title: 'DAO Dashboard'
        }
        , {
          // 'txHash' will be present in the object passed to the 'activate' method of the viewmodel
          route: ['txInfo/:txHash'],
          name: 'txInfo',
          moduleId: PLATFORM.moduleName('./txInfo/txInfo'),
          nav: false,
          title: 'Transaction Information'
        }
      ]);
      this.healthy = true;
    }

    this.router = router;
  }
  static SchemeDashboards = [
    "GlobalConstraintRegistrar",
    "SchemeRegistrar",
    "ContributionReward",
    "UpgradeScheme",
    "NonArc"
  ];

  public static hasDashboard(schemeName: string): boolean {
    return App.SchemeDashboards.indexOf(schemeName) !== -1;
  }
}

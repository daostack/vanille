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
        },
        /**
         * Scheme dashboards.  Currently used just to track what we have implements.  They aren't used
         * when composing.
         */
        , {
          route: ['SchemeRegistrar'],
          name: 'SchemeRegistrar',
          moduleId: PLATFORM.moduleName('./schemeDashboards/SchemeRegistrar'),
          nav: false,
          title: 'SchemeRegistrar Dashboard'
        }
        , {
          route: ['ContributionReward'],
          name: 'ContributionReward',
          moduleId: PLATFORM.moduleName('./schemeDashboards/ContributionReward'),
          nav: false,
          title: 'ContributionReward Dashboard'
        }
        , {
          route: ['UpgradeScheme'],
          name: 'UpgradeScheme',
          moduleId: PLATFORM.moduleName('./schemeDashboards/UpgradeScheme'),
          nav: false,
          title: 'UpgradeScheme Dashboard'
        }
        , {
          route: ['GlobalConstraintRegistrar'],
          name: 'GlobalConstraintRegistrar',
          moduleId: PLATFORM.moduleName('./schemeDashboards/GlobalConstraintRegistrar'),
          nav: false,
          title: 'GlobalConstraintRegistrar Dashboard'
        }
        , {
          route: ['UnknownArc'],
          name: 'UnknownArc',
          moduleId: PLATFORM.moduleName('./schemeDashboards/UnknownArc'),
          nav: false,
          title: 'UnknownArc Dashboard'
        }
        , {
          route: ['NotRegistered'],
          name: 'NotRegistered',
          moduleId: PLATFORM.moduleName('./schemeDashboards/NotRegistered'),
          nav: false,
          title: 'NotRegistered Dashboard'
        }
        , {
          route: ['NonArc'],
          name: 'NonArc',
          moduleId: PLATFORM.moduleName('./schemeDashboards/NonArc'),
          nav: false,
          title: 'NonArc Dashboard'
        },
        /**
         * Scheme configuration dashboards.  Currently used just to track what we have implements.  They aren't used
         * when composing.
         */
        , {
          route: ['SchemeRegistrar'],
          name: 'SchemeRegistrar',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/SchemeRegistrar'),
          nav: false,
          title: 'SchemeRegistrar Dashboard'
        }
        , {
          route: ['ContributionReward'],
          name: 'ContributionReward',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/ContributionReward'),
          nav: false,
          title: 'ContributionReward Configuration'
        }
        , {
          route: ['UpgradeScheme'],
          name: 'UpgradeScheme',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/UpgradeScheme'),
          nav: false,
          title: 'UpgradeScheme Configuration'
        }
        , {
          route: ['GlobalConstraintRegistrar'],
          name: 'GlobalConstraintRegistrar',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/GlobalConstraintRegistrar'),
          nav: false,
          title: 'GlobalConstraintRegistrar Configuration'
        }
        , {
          route: ['UnknownArcScheme'],
          name: 'UnknownArcScheme',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/UnknownArcScheme'),
          nav: false,
          title: 'UnknownArcScheme Configuration'
        }
        , {
          route: ['VotingMachineSelector'],
          name: 'VotingMachineSelector',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/VotingMachineSelector'),
          nav: false,
          title: 'VotingMachineSelector Configuration'
        }
        , {
          route: ['NonArcScheme'],
          name: 'NonArcScheme',
          moduleId: PLATFORM.moduleName('./schemeConfiguration/NonArcScheme'),
          nav: false,
          title: 'NonArcScheme Configuration'
        }
      ]);
      this.healthy = true;
    }

    this.router = router;
  }
}

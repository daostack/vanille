import { autoinject, LogManager } from 'aurelia-framework';
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
  private network: string;

  constructor(
    private web3: Web3Service,
    private arcService: ArcService
  ) {
    this.network = web3.networkName;
  }

  attached() {
    /* override the body style set in the spash screen */
    (<any>$('body'))
      .css({
        "color": "black",
        "background-color": "white"
      })
      .bootstrapMaterialDesign({ global: { label: { className: "bmd-label-floating" } } });

    const fixScrollbar = () => {

      const bodyHeight = $(window).outerHeight();
      const footerHeight = $('.footer.navbar').outerHeight();
      const headerHeight = $('.header.navbar').outerHeight();

      $('.content-body').css(
        {
          "max-height": `${bodyHeight - footerHeight - headerHeight}px`
        });
    }

    $(window).resize(fixScrollbar);

    fixScrollbar();
  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.title = 'DutchX Bootstrapper';
    /**
     * can be connected 
     */
    const haveDAOstack = !!this.arcService.arcContracts;
    const isConnected = this.web3.isConnected;
    const noAccount = !this.web3.defaultAccount;

    this.isConnected = isConnected && haveDAOstack;

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
        {
          // 'address' will be present in the object passed to the 'activate' method of the viewmodel
          // DutchX: set address to be optional, and this page as the default (instead of Home)
          route: ['', 'daoDashboard/:address?'],
          name: 'daoDashboard',
          moduleId: PLATFORM.moduleName('./organizations/dashboard'),
          nav: false,
          title: 'Dashboard'
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
    "Auction4Reputation",
    "ContributionReward",
    "ExternalLocking4Reputation",
    "FixedReputationAllocation",
    "GenesisProtocol",
    "GlobalConstraintRegistrar",
    "LockingEth4Reputation",
    "LockingToken4Reputation",
    "NonArc",
    "SchemeRegistrar",
    "UpgradeScheme",
  ];

  public static hasDashboard(schemeName: string): boolean {
    return App.SchemeDashboards.indexOf(schemeName) !== -1;
  }
}

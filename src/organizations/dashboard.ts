import { autoinject } from "aurelia-framework";
import { DaoService, VanilleDAO } from "../services/DaoService";
import { TokenService } from "../services/TokenService";
import { ArcService, WrapperService, Hash, StandardTokenWrapper, Utils } from "../services/ArcService";
import { SchemeService, SchemeInfo } from "../services/SchemeService";
import { AureliaHelperService } from "../services/AureliaHelperService";
import { App } from '../app';
import { BigNumber, Web3Service } from '../services/Web3Service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigFailure } from '../entities/GeneralEvents';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { SchemePermissionsSelector } from 'resources/customElements/schemePermissions/schemePermissions';

@autoinject
export class DAODashboard {

  private org: VanilleDAO;
  private address: string;
  private orgName: string;
  private tokenSymbol: string;
  // private daoTokenbalance: BigNumber;
  // private daoEthbalance: BigNumber;
  // private daoGenbalance: BigNumber;
  private registeredArcSchemes: Array<SchemeInfo>;
  private unregisteredArcSchemes: Array<SchemeInfo>;
  private nonArcSchemes: Array<SchemeInfo>;
  private arcSchemes: Array<SchemeInfo>;
  private subscription;
  // private omega;
  // private userReputation;
  // private userNativeTokens;
  private dataLoaded: boolean = false;
  private dashboardElement: any;

  private dutchXSchemes = new Map<string, { description: string, icon?: string }>([
    ["Auction4Reputation", { description: "BID GEN", icon: './daostack-icon-black.svg' }],
    ["ExternalLocking4Reputation", { description: "LOCK MGN", icon: './MGN_token_blue@3x.png' }],
    // ["FixedReputationAllocation", { description: "REDEEM YOUR COUPON" }],
    ["LockingEth4Reputation", { description: "LOCK ETH", icon: './ETHEREUM-ICON_Black_small.png' }],
    ["LockingToken4Reputation", { description: "LOCK GNO", icon: './gno_token.svg' }],
  ]);

  constructor(
    private daoService: DaoService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private schemeService: SchemeService
    , private aureliaHelperService: AureliaHelperService
    , private web3Service: Web3Service
    , private eventAggregator: EventAggregator
  ) {
  }

  async activate(options: any) {

    // DutchX hardcoded avatar
    this.address = options.address ||
      ((this.web3Service.networkName == "Ganache") ? "0xf7b7be05d6c115184f78226f905b643dd577fa6b" : "0xeeb9d711c43d9c79a8cbf30f859dbdbb80c2b9cf");
    this.org = await this.daoService.daoAt(this.address);
    if (this.org) {
      this.orgName = this.org.name;
      // let token = this.org.token;
      // this.tokenSymbol = await this.tokenService.getTokenSymbol(token);
      // // in Wei
      // this.daoTokenbalance = await this.tokenService.getTokenBalance(token, this.org.address);
      // this.daoEthbalance = await this.web3Service.getBalance(this.org.address);
      // try {
      //   const genToken = await this.tokenService.getGlobalGenToken();
      //   this.daoGenbalance = await this.tokenService.getTokenBalance(genToken, this.org.address);
      // } catch (ex) {
      //   this.daoGenbalance = new BigNumber(0);
      // }

      // // in Wei
      // this.omega = this.org.omega;
      // this.userReputation = await this.org.reputation.getBalanceOf(this.web3Service.defaultAccount);
      // this.userNativeTokens = await token.getBalanceOf(this.web3Service.defaultAccount);

      this.subscription = this.org.subscribe(VanilleDAO.daoSchemeSetChangedEvent, this.handleSchemeSetChanged.bind(this));
    } else {
      // don't force the user to see this as a snack every time.  A corrupt DAO may never be repaired.  A message will go to the console.
      // this.eventAggregator.publish("handleException", new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex));
      this.eventAggregator.publish("handleFailure",
        new EventConfigFailure(`Error loading DAO: ${this.address}`));
    }
    this.dataLoaded = true;
    return Promise.resolve();
  }

  deactivate() {
    if (this.subscription) {
      this.subscription.dispose();
      this.subscription = null;
    }
  }

  attached() {

    const dashboard = $(this.dashboardElement);

    /**
     * css will reference the 'selected' class
     */
    dashboard.on('show.bs.collapse', '.scheme-dashboard', function (e: Event) {
      // ignore bubbles from nested collapsables
      if (!$(this).is(<any>e.target)) return;

      const button = $(e.target);
      const li = button.closest('li');
      li.addClass("selected");
    });

    dashboard.on('hide.bs.collapse', '.scheme-dashboard', function (e: Event) {
      // ignore bubbles from nested collapsables
      if (!$(this).is(<any>e.target)) return;

      const button = $(e.target);
      const li = button.closest('li');
      li.removeClass("selected");
    });


    const button = $("#avatarHoverIcon") as any;
    let popover;

    const hidePopover = () => {
      if (popover) {
        button.popover('hide');
        popover = null;
      }
    };

    button.popover({
      toggle: "popover",
      placement: "bottom",
      trigger: "manual",
      container: "body",
      title: `DAO Address`,
      content: `<div class="nowrap"><etherscanlink address='${this.address}'></etherscanlink></div>`,
      html: true
    })
      .click((evt: any) => {
        button.popover('toggle');
      })
      .on('shown.bs.popover', (evt: any) => {
        popover = $('.popover.show')[0];

        // note this won't work so great if another popover is already showing
        this.aureliaHelperService.enhanceElement(popover, this);

        $('body').on('click', ".root", hidePopover);
        $('body').on('keyup', ".root", (evt: any) => {
          if (evt.keyCode == 27) {
            hidePopover();
          }
        });
      })
      .on('hide.bs.popover', (evt: any) => {
        $('body').off('click', ".root")
        $('body').off('keyup', ".root")
      });

    return this.loadSchemes();
  }

  async loadSchemes() {
    /**
     * Get all schemes associated with the DAO.  These can include non-Arc schemes.
     */
    let schemes = await this.schemeService.getSchemesForDao(this.address);

    // add a fake non-Arc scheme
    // schemes.push(<SchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    const nonArcSchemes = schemes.filter((s: SchemeInfo) => !s.inArc);

    for (let i = 0; i < nonArcSchemes.length; ++i) {
      const scheme = nonArcSchemes[i];
      const foundScheme = await this.findNonDeployedArcScheme(scheme);
      if (foundScheme) {
        schemes[schemes.indexOf(scheme)] = foundScheme;
      }
    }

    this.registeredArcSchemes = schemes.filter((s: SchemeInfo) => s.inArc && s.inDao)
      // DutchX: hack to remove all but the DutchX contracts
      .filter((s: SchemeInfo) => this.dutchXSchemes.has(s.name));

    this.registeredArcSchemes.map((s) => { s.friendlyName = this.dutchXSchemes.get(s.name).description; });
    this.unregisteredArcSchemes = schemes.filter((s: SchemeInfo) => s.inArc && !s.inDao);
    this.nonArcSchemes = schemes.filter((s: SchemeInfo) => !s.inArc);
    this.arcSchemes = schemes.filter((s: SchemeInfo) => s.inArc);

    /**
     * Go through the nonArcSchemes and see whether we can identify any of them.
     * 
     * Selecting from WrapperService.nonUniversalSchemeFactories, get the contract 
     */

    // const factory = WrapperService.nonUniversalSchemeFactories.LockingEth4Reputation;

    this.polishDom();

    return Promise.resolve();
  }

  private async findNonDeployedArcScheme(scheme: SchemeInfo): Promise<SchemeInfo | null> {
    for (const wrapperName in WrapperService.nonUniversalSchemeFactories) {
      const factory = WrapperService.nonUniversalSchemeFactories[wrapperName];
      if (factory) {
        const contract = await factory.ensureSolidityContract();
        const code = await (<any>Promise).promisify((callback: any): any =>
          this.web3Service.web3.eth.getCode(scheme.address, callback))();
        const found = code === contract.deployedBinary;
        if (found) {
          const wrapper = await factory.at(scheme.address);
          return SchemeInfo.fromContractWrapper(wrapper, true);
        }
      }
    }
    return null;
  }

  private polishDom() {
    // setTimeout(() => {

    // }, 0);
  }

  private async handleSchemeSetChanged(params: { dao: VanilleDAO, scheme: SchemeInfo }) {
    let schemeInfo = params.scheme;
    let addTo: Array<SchemeInfo>;
    let removeFrom: Array<SchemeInfo>;

    if (!schemeInfo.inArc) {
      const foundScheme = await this.findNonDeployedArcScheme(schemeInfo);
      if (foundScheme) {
        schemeInfo = foundScheme;
      }
    }

    if (schemeInfo.inDao) { // adding
      if (schemeInfo.inArc) {
        addTo = this.registeredArcSchemes;
        removeFrom = this.unregisteredArcSchemes;
      } else { // adding non-Arc scheme to the DAO, not actually possible yet, but for completeness...
        addTo = this.nonArcSchemes;
      }
    }
    else { // removing
      if (schemeInfo.inArc) {
        addTo = this.unregisteredArcSchemes;
        removeFrom = this.registeredArcSchemes;
      } else {
        removeFrom = this.nonArcSchemes;
      }
    }

    if (removeFrom) {
      let index = this.getSchemeIndexFromAddress(schemeInfo.address, removeFrom);
      if (index !== -1) // shouldn't ever be -1
      {
        // in case we're re-adding below, lets move the existing schemeInfo instance, in case that helps retain any information
        removeFrom.splice(index, 1)[0];
      }
    }

    if (addTo) {
      let index = this.getSchemeIndexFromAddress(schemeInfo.address, addTo); // should always be -1
      if (index === -1) {
        addTo.push(schemeInfo);
      }
    }

    this.polishDom();
  }

  getDashboardView(scheme: SchemeInfo): string {
    let name: string;
    let isArcScheme = false;
    if (!scheme.inArc) {
      name = "NonArc";
    } else if (!scheme.inDao) {
      name = "NotRegistered";
    } else {
      name = scheme.name;
      isArcScheme = true;
    }

    if (isArcScheme && !App.hasDashboard(name)) {
      name = "UnknownArc";
    }
    return `../schemeDashboards/${name}`;
  }

  schemeDashboardViewModel(scheme: SchemeInfo): SchemeDashboardModel {
    return Object.assign({}, {
      org: this.org,
      orgName: this.orgName,
      orgAddress: this.address,
      tokenSymbol: this.tokenSymbol,
      allSchemes: this.arcSchemes
    },
      scheme)
  }

  getSchemeIndexFromAddress(address: string, collection: Array<SchemeInfo>): number {
    let result = collection.filter((s) => s.address === address);
    if (result.length > 1) {
      throw new Error("getSchemeInfoWithAddress: More than one schemes found");
    }
    return result.length ? collection.indexOf(result[0]) : -1;
  }
}

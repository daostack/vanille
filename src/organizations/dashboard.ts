import { autoinject, computedFrom } from "aurelia-framework";
import { DaoService, VanilleDAO } from "../services/DaoService";
import { TokenService } from "../services/TokenService";
import { ArcService } from "../services/ArcService";
import { SchemeService, SchemeInfo } from "../services/SchemeService";
import { PLATFORM } from 'aurelia-pal';
import { AureliaHelperService } from "../services/AureliaHelperService";
import { App } from '../app';
import { BigNumber, Web3Service } from '../services/Web3Service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigFailure } from '../entities/GeneralEvents';

@autoinject
export class DAODashboard {

  org: VanilleDAO;
  address: string;
  orgName: string;
  tokenSymbol: string;
  daoTokenbalance: BigNumber;
  daoEthbalance: BigNumber;
  daoGenbalance: BigNumber;
  registeredArcSchemes: Array<SchemeInfo>;
  unregisteredArcSchemes: Array<SchemeInfo>;
  nonArcSchemes: Array<SchemeInfo>;
  arcSchemes: Array<SchemeInfo>;
  subscription;
  omega;
  userReputation;
  userNativeTokens;
  dataLoaded: boolean = false;


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

    setTimeout(async () => {
      this.address = options.address;
      this.org = await this.daoService.daoAt(this.address);
      if (this.org) {
        this.orgName = this.org.name;
        let token = this.org.token;
        this.tokenSymbol = await this.tokenService.getTokenSymbol(this.org.token);
        // in Wei
        this.daoTokenbalance = await this.tokenService.getTokenBalance(this.org.token, this.org.address);
        this.daoEthbalance = await this.web3Service.getBalance(this.org.address);
        try {
          const genToken = await this.tokenService.getGlobalGenToken();
          this.daoGenbalance = await this.tokenService.getTokenBalance(genToken, this.org.address);
        } catch (ex) {
          this.daoGenbalance = new BigNumber(0);
        }

        // in Wei
        this.omega = this.org.omega;
        this.userReputation = await this.org.reputation.reputationOf(this.web3Service.defaultAccount);
        this.userNativeTokens = await this.org.token.getBalanceOf(this.web3Service.defaultAccount);

        this.subscription = this.org.subscribe(VanilleDAO.daoSchemeSetChangedEvent, this.handleSchemeSetChanged.bind(this));

        await this.loadSchemes();
      } else {
        // don't force the user to see this as a snack every time.  A corrupt DAO may never be repaired.  A message will go to the console.
        // this.eventAggregator.publish("handleException", new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex));
        this.eventAggregator.publish("handleFailure",
          new EventConfigFailure(`Error loading DAO: ${this.address}`));
      }
      this.dataLoaded = true;
    }, 0);
  }

  deactivate() {
    if (this.subscription) {
      this.subscription.dispose();
      this.subscription = null;
    }
  }

  async loadSchemes() {
    /**
     * Get all schemes associated with the DAO.  These can include non-Arc schemes.
     */
    let schemes = await this.schemeService.getSchemesForDao(this.address);

    // add a fake non-Arc scheme
    // schemes.push(<SchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    this.registeredArcSchemes = Array.from(schemes).filter((s: SchemeInfo) => s.inArc && s.inDao);
    this.unregisteredArcSchemes = Array.from(schemes).filter((s: SchemeInfo) => s.inArc && !s.inDao);
    this.nonArcSchemes = Array.from(schemes).filter((s: SchemeInfo) => !s.inArc);
    this.arcSchemes = Array.from(schemes).filter((s: SchemeInfo) => s.inArc);
    this.polishDom();
  }

  polishDom() {
    setTimeout(() => {
      ($(".scheme-use-button") as any).tooltip();
      // workaround for accordian behavior not working.  Check to see if it's fixed when the
      // final version 4 is released
      $('.collapse').on('show.bs.collapse', () => {
        ($('.collapse') as any).collapse("hide");
      });
    }, 0);
  }

  private handleSchemeSetChanged(params: { dao: VanilleDAO, scheme: SchemeInfo }) {
    let schemeInfo = params.scheme;
    let addTo: Array<SchemeInfo>;
    let removeFrom: Array<SchemeInfo>;

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

  useScheme(scheme: SchemeInfo) {
    this.toggleDashboardVisibility(scheme);
  }

  toggleDashboardVisibility(scheme: SchemeInfo) {
    ($(`#${scheme.name}`) as any).collapse("toggle");
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

  schemeDashboardViewModel(scheme: SchemeInfo): any {
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

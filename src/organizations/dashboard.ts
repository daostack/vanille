import { autoinject, computedFrom } from "aurelia-framework";
import { DaoService, VanilleDAO } from "../services/DaoService";
import { TokenService } from "../services/TokenService";
import { ArcService } from "../services/ArcService";
import { SchemeService, SchemeInfo } from "../services/SchemeService";
import { PLATFORM } from 'aurelia-pal';
import { AureliaHelperService } from "../services/AureliaHelperService";
import { App } from '../app';

@autoinject
export class DAODashboard {

  org: VanilleDAO;
  address: string;
  orgName: string;
  tokenSymbol: string;
  userTokenbalance: Number;
  registeredArcSchemes: Array<SchemeInfo>;
  unregisteredArcSchemes: Array<SchemeInfo>;
  nonArcSchemes: Array<SchemeInfo>;
  arcSchemes: Array<SchemeInfo>;
  subscription;
  omega;
  dataLoaded: boolean = false;


  constructor(
    private daoService: DaoService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private schemeService: SchemeService
    , private aureliaHelperService: AureliaHelperService

  ) {
  }

  async activate(options: any) {

    setTimeout(async () => {
      this.address = options.address;
      this.org = await this.daoService.daoAt(this.address);
      this.orgName = this.org.name;
      let token = this.org.token;
      this.tokenSymbol = await this.tokenService.getTokenSymbol(this.org.token);
      // in Wei
      this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
      // in Wei
      this.omega = this.org.omega;

      this.subscription = this.org.subscribe(VanilleDAO.daoSchemeSetChangedEvent, this.handleSchemeSetChanged.bind(this));

      await this.loadSchemes();
      this.dataLoaded = true;
    }, 0);
  }

  deactivate() {
    this.subscription.dispose();
    this.subscription = null;
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

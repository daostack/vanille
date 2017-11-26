import { autoinject, computedFrom } from "aurelia-framework";
import { OrganizationService, DAO } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { PLATFORM } from 'aurelia-pal';

@autoinject
export class DAODashboard {
  
  private org:DAO;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private registeredArcSchemes: Array<SchemeInfo>;
  private unregisteredArcSchemes: Array<SchemeInfo>;
  private nonArcSchemes: Array<SchemeInfo>;
  private arcSchemes: Array<SchemeInfo>;
  private subscription;

  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private schemeService: SchemeService
    
  ) {
  }

  async activate(options: any) {

    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = this.org.name;
    let token = this.org.token;
    this.tokenSymbol = await this.tokenService.getTokenSymbol(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);

    await this.loadSchemes();

    this.subscription = this.org.subscribe(DAO.daoSchemeSetChangedEvent, (params: { dao:DAO, scheme: SchemeInfo }) => 
    {
      let schemeInfo = params.scheme;
      let addTo:Array<SchemeInfo>;
      let removeFrom:Array<SchemeInfo>;

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
          schemeInfo = removeFrom.splice(index,1)[0];
        }
      }

      if (addTo) {
        let index = this.getSchemeIndexFromAddress(schemeInfo.address, addTo); // should always be -1
        if (index === -1) {
          addTo.push(schemeInfo);
        }
      }
    });
  }

  deactivate() {
    this.subscription.dispose();
    this.subscription = null;
  }

  attached() {
    ($(".scheme-use-button") as any).tooltip();
    // workaround for accordian behavior not working.  Check to see if it's fixed when the
    // final version 4 is released
    $('.collapse').on('show.bs.collapse', () =>  {
      ($('.collapse') as any).collapse("hide");
    });
  }

  async loadSchemes() {
    /**
     * Get all schemes associated with the DAO.  These can include non-Arc schemes.
     */
    let schemes = await this.schemeService.getSchemesForDao(this.address);

    // add a fake non-Arc scheme
    schemes.push(<SchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    this.registeredArcSchemes =   Array.from(schemes).filter((s: SchemeInfo) => s.inArc && s.inDao);
    this.unregisteredArcSchemes = Array.from(schemes).filter((s: SchemeInfo) => s.inArc && !s.inDao);
    this.nonArcSchemes =          Array.from(schemes).filter((s: SchemeInfo) => !s.inArc);
    this.arcSchemes =             Array.from(schemes).filter((s: SchemeInfo) => s.inArc);
  }

  useScheme(scheme: SchemeInfo) {
    this.toggleDashboardVisibility(scheme);
  }

  toggleDashboardVisibility(scheme: SchemeInfo) {
      ($(`#${scheme.key}`) as any).collapse("toggle");
  }

  getDashboardView(scheme: SchemeInfo):string {
      let key:string;
      if (!scheme.inArc) {
        key = "NonArc";
      } else if (!scheme.inDao) {
        key = "NotRegistered";
      } else {
        key = scheme.key;
      }
      return `../schemeDashboards/${key}`;
  }

  schemeDashboardViewModel(scheme: SchemeInfo): any {
      return Object.assign({}, { org: this.org, orgName: this.orgName, orgAddress: this.address, tokenSymbol: this.tokenSymbol, allSchemes: this.arcSchemes }, scheme )
  }

  getSchemeIndexFromAddress(address:string, collection: Array<SchemeInfo>): number {
    let result = collection.filter((s) => s.address === address);
    if (result.length > 1) {
      throw new Error("getSchemeInfoWithAddress: More than one schemes found");
    }
    return result.length ? collection.indexOf(result[0]) : -1;
  }
}

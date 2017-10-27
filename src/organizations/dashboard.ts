import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { DaoSchemeRepositoryService } from  "../services/DaoSchemeRepositoryService";
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import "./dashboard.scss";

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private schemes: Array<DashboardSchemeInfo>;
  
  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private daoSchemeRepositoryService: DaoSchemeRepositoryService
    , private schemeService: SchemeService
    
  ) {
  }

  async activate(options: any) {
    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    this.tokenSymbol = await this.tokenService.getTokenName(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
    let schemes = (await this.schemeService.getSchemesInDao(this.address)).map((s) => { (s as any).isRegistered = true; return s as DashboardSchemeInfo; });

    /**
     * now merge the list of daos that the org has with daos that it doesn't have
     */

    let availableSchemes = this.schemeService.availableSchemes;
    let schemesAvailableToBeAdded:Array<DashboardSchemeInfo> = [];
    for (let availableScheme of availableSchemes) {
      let found = schemes.find((s) => s.key === availableScheme.key);
      if (!found) {
        (availableScheme as any).isRegistered = false;
        schemesAvailableToBeAdded.push(availableScheme as DashboardSchemeInfo );
      }
    }
    this.schemes = schemes.concat(schemesAvailableToBeAdded);
  }

  attached() {
    ($(".scheme-use-button") as any).tooltip();
    ($(".scheme-delete-button") as any).tooltip();
    ($(".scheme-add-button") as any).tooltip();
    ($(`.collapse`) as any).data("parent","#accordian");
    // workaround for accordian behavior not working.  Check to see if it's fixed when the
    // final version 4 is released
    $('.collapse').on('show.bs.collapse', () =>  {
      ($('.collapse') as any).collapse("hide");
    });
  }

  toggleDashboardVisibility(key) {
    ($(`#${key}`) as any).collapse("toggle");
    setTimeout(() => { ($(`.scheme-use-button`) as any).tooltip("hide"); });
  }

  getDashboardView(key:string):string {
    return this.daoSchemeRepositoryService.dashboardForScheme(key);
  }
}

interface DashboardSchemeInfo extends SchemeInfo {
  isRegistered: boolean;
}

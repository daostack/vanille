import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { DaoSchemeRepositoryService, SchemeInfo } from  "../services/DaoSchemeRepositoryService";
import "./dashboard.scss";

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private schemes: Array<SchemeInfo>;
  
  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private daoSchemeRepositoryService: DaoSchemeRepositoryService
    
  ) {
  }

  async activate(options: any) {
    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    this.tokenSymbol = await this.tokenService.getTokenName(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
    this.schemes = await this.daoSchemeRepositoryService.getSchemesInDao(this.address);
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
}

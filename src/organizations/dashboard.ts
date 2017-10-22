import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  
  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    
  ) {
  }

  async activate(options: any) {
    this.address = options.address;
  }

  async attached() {
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    this.tokenSymbol = await this.tokenService.getTokenName(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
  }
}

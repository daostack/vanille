import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService, ContractInfo } from  "../services/ArcService";

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private schemes: Array<ContractInfo>;
  
  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    
  ) {
  }

  async activate(options: any) {
    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    this.tokenSymbol = await this.tokenService.getTokenName(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
    this.schemes = await this.arcService.getSchemesForDao(this.address);
  }

  async attached() {
  }
}

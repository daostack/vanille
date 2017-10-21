import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;

  constructor(
    private organizationService: OrganizationService
  ) {
  }

  async activate(options: any) {
    this.address = options.address;
  }

  async attached() {
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
  }
}

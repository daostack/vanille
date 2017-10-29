// import { autoinject } from "aurelia-framework";
// import { ArcService, TruffleContract } from '../../services/ArcService';
import { DAO } from "../../services/OrganizationService";
// import { DashboardSchemeInfo } from "../../organizations/dashboard";

export class SchemeProposalParams {
  org: DAO;
  params: any;

  activate(model) {
    this.org = model.org;
    this.params = model.params;
  }
}

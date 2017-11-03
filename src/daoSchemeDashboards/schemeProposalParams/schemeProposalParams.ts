// import { autoinject } from "aurelia-framework";
import { DAO } from "../../services/OrganizationService";
// import { DaoSchemeInfo } from "../../services/SchemeService";

export class SchemeProposalParams {
  org: DAO;
  params: any;

  activate(model) {
    this.org = model.org;
    this.params = model.params;
  }
}

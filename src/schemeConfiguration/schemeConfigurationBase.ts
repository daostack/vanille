import { DAO } from "../services/OrganizationService";

export class SchemeConfigurationBase {
  model: any;

  activate(model) {
    this.model = model;
  }
}

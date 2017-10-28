import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract } from '../services/ArcService';
import { OrganizationService, Organization } from "../services/OrganizationService";
import "./daoSchemeDashboard.scss";

export class DaoSchemeDashboard {
    /**
     * ready-to-use TruffleContract
     */
    contract: TruffleContract;
    address: string;
    /**
     * Pretty name
     */
    name: string;
    /**
     * short name (used by ArcService.getContract())
     */
    key: string;
    isRegistered: boolean;
    org: Organization;
    orgName: string;

    activate(model) {
      this.name = model.name;
      this.key = model.key;
      this.address = model.address;
      this.isRegistered = model.isRegistered;
      this.org = model.organization;
      this.orgName = model.orgName;
  }
}

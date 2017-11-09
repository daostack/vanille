import { autoinject } from "aurelia-framework";
import { ArcService } from '../services/ArcService';
import { OrganizationService, DAO } from "../services/OrganizationService";
import { SchemeInfo } from "../services/SchemeService";

export class DaoSchemeDashboard {
    /**
     * ready-to-use TruffleContract
     */
    // contract: TruffleContract;
    address: string;
    orgAddress: string;
    /**
     * Pretty name
     */
    name: string;
    /**
     * short name (used by ArcService.getContract())
     */
    key: string;
    org: DAO;
    orgName: string;
    allSchemes: Array<SchemeInfo>;

    activate(model) {
      this.name = model.name;
      this.key = model.key;
      this.address = model.address;
      this.org = model.org;
      this.orgName = model.orgName;
      this.orgAddress = model.orgAddress;
      this.allSchemes = model.allSchemes;
  }
}

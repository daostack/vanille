import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract } from '../services/ArcService';
import { OrganizationService, DAO } from "../services/OrganizationService";
import { DashboardSchemeInfo } from "../organizations/dashboard";
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
    org: DAO;
    orgName: string;
    allSchemes: Array<DashboardSchemeInfo>;

    activate(model) {
      this.name = model.name;
      this.key = model.key;
      this.address = model.address;
      this.isRegistered = model.isRegistered;
      this.org = model.org;
      this.orgName = model.orgName;
      this.allSchemes = model.allSchemes;
  }
}

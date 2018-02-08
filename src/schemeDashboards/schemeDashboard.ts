import { autoinject } from "aurelia-framework";
import { ArcService } from '../services/ArcService';
import { DaoService, DAO } from "../services/DaoService";
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
  friendlyName: string;
  /**
   * short name (used by ArcService.getContract())
   */
  name: string;
  org: DAO;
  orgName: string;
  allSchemes: Array<SchemeInfo>;

  activate(model) {
    this.friendlyName = model.friendlyName;
    this.name = model.name;
    this.address = model.address;
    this.org = model.org;
    this.orgName = model.orgName;
    this.orgAddress = model.orgAddress;
    this.allSchemes = model.allSchemes;
  }
}

import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo } from '../services/ArcService';
import { OrganizationService, Organization } from '../services/OrganizationService';
// import { DaoSchemeDashboard } from "../daoSchemeDashboards/daoSchemeDashboard";

@autoinject
export class ControllerService {

  constructor(
    private organizationService: OrganizationService
    , private arcService: ArcService
  ) {
  }
  
  public async addSchemeToDao(
    daoAddress: string,
    schemeAddress: string,
    parameters: any,
    permissions: Permissions ) {

    let org = await this.organizationService.organizationAt(daoAddress);
    let controller = org.organization;
    let scheme = await this.arcService.getContract(schemeAddress);

    let txAddToController = await controller.registerScheme(schemeAddress, parameters, permissions);

    await org.token.transfer(daoAddress, await scheme.fee());

    let txAddToSchema = await scheme.registerOrganization(daoAddress);
  }

  public async removeSchemeFromDao(
    daoAddress: string,
    schemeAddress: string ) {

    let org = await this.organizationService.organizationAt(daoAddress);
    let controller = org.organization;
    let scheme = await this.arcService.getContract(schemeAddress);

    let txRemoFromToController = await controller.unregisterScheme(schemeAddress);

    let txRemoveFromSchema = await scheme.unregisterOrganization(daoAddress);
  }

}

// All 0: Not registered,
// 1st bit: Flag if the scheme is registered,
// 2nd bit: Scheme can register other schemes
// 3th bit: Scheme can add/remove global constraints
// 4rd bit: Scheme can upgrade the controller
export enum Permissions {
  NotRegistered = 0,
  Registered = 1 << 0,
  CanRegisterOtherSchemes = 1 << 1, 
  CanAddRemoveGlobalConstraints = 1 << 2,
  CanUpgradeController = 1 << 3, 
  All = ~(~0 << 4)  // all four bits
}


// function dec2bin(dec){
//   return (dec >>> 0).toString(2);
// }

// web3.padLeft(dec2bin(num)),32)

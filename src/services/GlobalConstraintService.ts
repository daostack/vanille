import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import {OrganizationService, Organization } from './OrganizationService';

@autoinject
export class GlobalConstraintService {

/**
 * The Arc global contraints that we make available to the user
 */
public globalConstraints: Array<GlobalConstraintInfo>;

constructor(
  private arcService: ArcService
  , private organizationService: OrganizationService
) {
    this.globalConstraints = this.arcService.arcGlobalConstraints;
    // TODO: should come from arcService or emergent-arc
    this.defaultConstraint = this.globalConstraints.filter((vm) => vm.key === "TokenCapGC")[0];
  }

  public defaultConstraint: GlobalConstraintInfo;

  public async getGlobalConstraintConfigHash(
    orgAddress: string,
    globalConstraintInfo: GlobalConstraintInfo // Knows how to compute the hash
    , globalConstraintConfig: GlobalConstraintConfig // Knows how to compute the hash
  ) {
      
    const org = await this.organizationService.organizationAt(orgAddress);
    const globalConstraint = await this.arcService.getContract(globalConstraintInfo.key);
    return await globalConstraintConfig.getHash(globalConstraint, org);
  }
}

export class GlobalConstraintInfo extends ContractInfo {
}

export interface GlobalConstraintConfig {
  getHash(globalConstraintInfo: GlobalConstraintInfo, org: Organization);
}

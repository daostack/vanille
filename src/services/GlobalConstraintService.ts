import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import {OrganizationService, DAO } from './OrganizationService';
import { SchemeService } from '../services/SchemeService';

@autoinject
export class GlobalConstraintService {

/**
 * The Arc global contraints that we make available to the user
 */
public globalConstraints: Array<GlobalConstraintInfo>;

constructor(
  private arcService: ArcService
  , private organizationService: OrganizationService
  , private schemeService: SchemeService
) {
    this.globalConstraints = this.arcService.arcGlobalConstraints;
    // TODO: should come from arcService or daostack-arc-js
    this.defaultConstraint = this.globalConstraints.filter((vm) => vm.name === "TokenCapGC")[0];
  }

  public defaultConstraint: GlobalConstraintInfo;
}

export class GlobalConstraintInfo extends ContractInfo {
}

export interface GlobalConstraintConfig {
  getConfigurationHash(orgAddress: string, gcAddress?: string);
}  


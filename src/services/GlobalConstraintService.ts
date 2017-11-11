import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';

@autoinject
export class GlobalConstraintService {

/**
 * The Arc global contraints that we make available to the user
 */
public globalConstraints: Array<GlobalConstraintInfo>;

constructor(
  private arcService: ArcService
) {
    this.globalConstraints = this.arcService.arcGlobalConstraints;
    // TODO: should come from arcService or emergent-arc
    this.defaultConstraint = this.globalConstraints.filter((vm) => vm.key === "TokenCapGC")[0];
  }

  public defaultConstraint: GlobalConstraintInfo;
}

export class GlobalConstraintInfo extends ContractInfo {
}

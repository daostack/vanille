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

  public async getVoteParametersHash(
    globalConstraintInfo: GlobalConstraintInfo,
    reputationAddress: string, 
    votePrec: Number, 
    ownerVote: boolean) {
    
    const contract = await this.arcService.getContract(globalConstraintInfo.key);
    return await contract.getParametersHash(reputationAddress, votePrec, ownerVote);
  }

  public defaultConstraint: GlobalConstraintInfo;
}

export class GlobalConstraintInfo extends ContractInfo {
}

import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';

@autoinject
export class VotingMachineService {

/**
 * The Arc voting machine that we make available to the user
 */
public votingMachines: Array<VotingMachineInfo>;

constructor(
  private arcService: ArcService
) {
    this.votingMachines = this.arcService.arcVotingMachines;
    // TODO: should come from arcService or emergent-arc
    this.defaultMachine = this.votingMachines.filter((vm) => vm.key === "AbsoluteVote")[0];
  }

  public async getVoteParametersHash(
    votingMachineInfo: VotingMachineInfo,
    reputationAddress: string, 
    votePrec: Number, 
    ownerVote: boolean) {
    
    const contract = await this.arcService.getContract(votingMachineInfo.key);
    return await contract.getParametersHash(reputationAddress, votePrec, ownerVote);
  }

  public defaultMachine: VotingMachineInfo;
}

export class VotingMachineInfo extends ContractInfo {
}

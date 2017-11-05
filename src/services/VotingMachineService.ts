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
  }
}

export class VotingMachineInfo extends ContractInfo {
}

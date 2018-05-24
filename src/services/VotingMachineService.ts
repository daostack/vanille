import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractWrapperInfo, ContractWrapperBase } from './ArcService';
import { DaoService, VanilleDAO } from './DaoService';
import { SchemeService } from '../services/SchemeService';

@autoinject
export class VotingMachineService {

  /**
   * The Arc voting machine that we make available to the user
   */
  public votingMachines: Array<VotingMachineInfo>;
  public defaultMachine: VotingMachineInfo;

  constructor(
    private arcService: ArcService
    , private daoService: DaoService
    , private schemeService: SchemeService
  ) {
    this.votingMachines = this.arcService.arcVotingMachines;
    // TODO: this should be in a application settings service or some such?
    this.defaultMachine = this.votingMachines.filter((vm) => vm.name === "AbsoluteVote")[0];
  }
}

export class VotingMachineInfo extends ContractWrapperInfo {
}

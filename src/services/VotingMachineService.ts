import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import {OrganizationService, DAO } from './OrganizationService';
import { SchemeService } from '../services/SchemeService';

@autoinject
export class VotingMachineService {

/**
 * The Arc voting machine that we make available to the user
 */
public votingMachines: Array<VotingMachineInfo>;

constructor(
  private arcService: ArcService
  , private organizationService: OrganizationService
  , private schemeService: SchemeService
) {
    this.votingMachines = this.arcService.arcVotingMachines;
    // TODO: should come from arcService or daostack-arc
    this.defaultMachine = this.votingMachines.filter((vm) => vm.name === "AbsoluteVote")[0];
  }
  public defaultMachine: VotingMachineInfo;
}

export class VotingMachineInfo extends ContractInfo {
}

export interface VotingMachineConfig {
  getConfigurationHash(orgAddress: string, votingMachineAddress?: string);
}

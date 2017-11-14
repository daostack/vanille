import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import {OrganizationService, Organization } from './OrganizationService';

@autoinject
export class VotingMachineService {

/**
 * The Arc voting machine that we make available to the user
 */
public votingMachines: Array<VotingMachineInfo>;

constructor(
  private arcService: ArcService
  , private organizationService: OrganizationService
) {
    this.votingMachines = this.arcService.arcVotingMachines;
    // TODO: should come from arcService or emergent-arc
    this.defaultMachine = this.votingMachines.filter((vm) => vm.key === "AbsoluteVote")[0];
  }

  public async getVotingMachineConfigHash(
    orgAddress: string,
    votingMachineInfo: VotingMachineInfo,    // ContractInfo
    votingMachineConfig: VotingMachineConfig // Knows how to compute the hash
  ) {
      
    const org = await this.organizationService.organizationAt(orgAddress);
    const votingMachine = await this.arcService.getContract(votingMachineInfo.key);
    return await votingMachineConfig.getHash(votingMachine, org);
  }

  public defaultMachine: VotingMachineInfo;
}

export class VotingMachineInfo extends ContractInfo {
}

export interface VotingMachineConfig {
  getHash(votingMachine: TruffleContract, org: Organization);
}

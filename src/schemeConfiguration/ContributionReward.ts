import { autoinject } from 'aurelia-framework';
import { SchemeConfigModel } from './schemeConfigModel';
import { VotingMachineInfo } from '../services/VotingMachineService';
import { ArcService, ContributionRewardParams } from "../services/ArcService";
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

@autoinject
export class ContributionReward {

  votingMachineInfo: VotingMachineInfo;
  votingMachineConfig: Partial<VotingMachineConfigModel> = {};
  model: Partial<ContributionRewardParams>;

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model: Partial<ContributionRewardParams & VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    this.votingMachineConfig = { voteParametersHash: model.voteParametersHash };
    this.model = model = Object.assign({ orgNativeTokenFee: 0 }, model);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, this.votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachineAddress": this.votingMachineInfo.address,
      "orgNativeTokenFee": this.model.orgNativeTokenFee,
    }, "ContributionReward", schemeAddress);
  }

}

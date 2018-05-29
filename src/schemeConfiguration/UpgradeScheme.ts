import { autoinject } from 'aurelia-framework';
import { VotingMachineInfo } from '../services/VotingMachineService';
import { ArcService, StandardSchemeParams } from "../services/ArcService";
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

@autoinject
export class UpgradeScheme {

  votingMachineConfig: Partial<VotingMachineConfigModel> = {};
  votingMachineInfo: VotingMachineInfo = null;
  model: Partial<StandardSchemeParams>;

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model: Partial<StandardSchemeParams & VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    this.votingMachineConfig = { voteParametersHash: model.voteParametersHash };
    this.model = model;
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, this.votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachineAddress": this.votingMachineInfo.address
    }, "UpgradeScheme", schemeAddress);
  }

}

import { autoinject } from 'aurelia-framework';
import { VotingMachineInfo } from '../services/VotingMachineService';
import { ArcService, SchemeRegistrarParams } from "../services/ArcService";
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

@autoinject
export class SchemeRegistrar {

  votingMachineConfig: Partial<VotingMachineConfigModel> = {};
  votingMachineInfo: VotingMachineInfo = null;
  model: Partial<SchemeRegistrarParams>;

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model: Partial<SchemeRegistrarParams & VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    Object.assign(this.votingMachineConfig, model);
    this.model = model;
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, this.votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachineAddress": this.votingMachineInfo.address
    }, "SchemeRegistrar", schemeAddress);
  }

}

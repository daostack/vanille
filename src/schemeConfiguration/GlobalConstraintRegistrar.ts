import { autoinject } from 'aurelia-framework';
import { SchemeConfigModel } from './schemeConfigModel';
import { VotingMachineInfo } from '../services/VotingMachineService';
import { ArcService, StandardSchemeParams } from '../services/ArcService';
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

@autoinject
export class GlobalConstraintRegistrar {

  votingMachineInfo: VotingMachineInfo = null;
  votingMachineConfig: Partial<VotingMachineConfigModel> = {};

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model: Partial<StandardSchemeParams & SchemeConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    let params: any = {};

    const votingMachineInfo = this.votingMachineInfo;

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachineAddress": this.votingMachineInfo.address
    }, "GlobalConstraintRegistrar", schemeAddress);
  }
}

import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { ArcService } from '../services/ArcService';

@autoinject
export class GlobalConstraintRegistrar implements SchemeConfigurator {

  votingMachineInfo: VotingMachineInfo = null;
  votingMachineConfig: VotingMachineConfig = <any>{};

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    let params: any = {};

    const votingMachineInfo = this.votingMachineInfo;

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachineAddress": this.votingMachineInfo.address
    }, "GlobalConstraintRegistrar", schemeAddress);
  }
}

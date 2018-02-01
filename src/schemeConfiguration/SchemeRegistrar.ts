import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { ArcService } from "../services/ArcService";

@autoinject
export class SchemeRegistrar implements SchemeConfigurator {

  votingMachineConfig: VotingMachineConfig = <any>{};
  votingMachineInfo: VotingMachineInfo = null;

  constructor(
    private arcService: ArcService
  ) {
  }

  activate(model) {
    model.getConfigurationHash = this.getConfigurationHash.bind(this);
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {

    const voteParamsHash = await this.votingMachineConfig.getConfigurationHash(orgAddress, this.votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash": voteParamsHash,
      "votingMachine": this.votingMachineInfo.address
    }, "SchemeRegistrar", schemeAddress);
  }

}

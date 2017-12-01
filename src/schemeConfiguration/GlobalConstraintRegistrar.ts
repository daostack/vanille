import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator} from './schemeConfigurationBase';
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { ArcService } from '../services/ArcService';

@autoinject
export class GlobalConstraintRegistrar implements SchemeConfigurator  {

  votingMachineInfo: VotingMachineInfo = null;
  votingMachineConfig: VotingMachineConfig = <any>{};

  constructor(
    private arcService: ArcService
  ) {
    // super();
  }

  activate(model) {
      model.getConfigurationHash = this.getConfigurationHash.bind(this);
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    let params:any = {};

    const votingMachineInfo = this.votingMachineInfo;

    const voteParamsHash = this.votingMachineConfig.getConfigurationHash(orgAddress, votingMachineInfo.address);

    return await this.arcService.setContractParameters({
      "voteParametersHash" : voteParamsHash,
      "votingMachine" : this.votingMachineInfo.address
    }, "GlobalConstraintRegistrar", schemeAddress);
  }
}

import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator} from './schemeConfigurationBase';
import { VotingMachineService, VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { SchemeService, ContractInfo } from '../services/SchemeService';

@autoinject
export class GlobalConstraintRegistrar implements SchemeConfigurator  {

  votingMachineInfo: VotingMachineInfo = null;
  fee = 0;
  votingMachineConfig: VotingMachineConfig = <any>{};

  constructor(
      private votingMachineService: VotingMachineService
    , private schemeService: SchemeService
  ) {
    // super();
  }

  activate(model) {
      model.getConfigurationHash = this.getConfigurationHash.bind(this);
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    let params:any = {};

    const votingMachineInfo = this.votingMachineInfo;

    const voteParamsHash = await this.votingMachineService.getVotingMachineConfigHash(
        orgAddress,
        votingMachineInfo,
        this.votingMachineConfig);

    return await this.schemeService.setSchemeParameters({
      "voteParametersHash" : voteParamsHash,
      "votingMachine" : this.votingMachineInfo.address
      , "fee" : this.fee
    }, "GlobalConstraintRegistrar", schemeAddress);
  }
}

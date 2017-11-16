import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator} from './schemeConfigurationBase';
import { VotingMachineService, VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { SchemeService, ContractInfo } from '../services/SchemeService';

@autoinject
export class SimpleContributionScheme implements SchemeConfigurator  {

  orgNativeTokenFee = 0;
  schemeNativeTokenFee = 0;
  votingMachineInfo = null;
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

  async getConfigurationHash(scheme: ContractInfo, orgAddress: string): Promise<any> {

    const voteParamsHash = await this.votingMachineService.getVotingMachineConfigHash(
        orgAddress,
        this.votingMachineInfo,
        this.votingMachineConfig);

    return await this.schemeService.setSchemeParameters(scheme, {
      "voteParametersHash" : voteParamsHash,
      "votingMachine" : this.votingMachineInfo.address,
      "orgNativeTokenFee": this.orgNativeTokenFee,
      "schemeNativeTokenFee": this.schemeNativeTokenFee
    });
  }

}

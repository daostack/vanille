import { bindable } from 'aurelia-framework';
import { SchemeConfigurationBase } from './schemeConfigurationBase';
import { VotingMachineInfo } from "../../services/VotingMachineService";

export class SimpleContributionScheme extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.orgNativeTokenFee = 0
    model.schemeNativeTokenFee = 0;
    model.intVote = null; // VotingMachineInfo
    
    // Voting machine configuration
    // model.votePrec = 50;
    // model.ownerVote = true;
    
    return super.activate(model);
  }
}

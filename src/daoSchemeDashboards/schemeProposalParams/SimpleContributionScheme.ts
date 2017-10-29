import { bindable } from 'aurelia-framework';
import { SchemeProposalParams } from './schemeProposalParams';

export class SimpleContributionScheme extends SchemeProposalParams  {

  constructor() {
    super();
  }

  activate(model) {
    model.params.votePrec = 50;
    model.params.orgNativeTokenFee = 0
    model.params.schemeNativeTokenFee = 0;
    model.params.ownerVote = true;
    model.params.intVote = model.org.votingMachine.address;
    return super.activate(model);
  }
}

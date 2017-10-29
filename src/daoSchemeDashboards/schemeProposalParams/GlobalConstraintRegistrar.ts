import { bindable } from 'aurelia-framework';
import { SchemeProposalParams } from './schemeProposalParams';

export class GlobalConstraintRegistrar extends SchemeProposalParams  {

  constructor() {
    super();
  }

  activate(model) {
    model.params.votePrec = 50;
    model.params.intVote = model.org.votingMachine.address;
    return super.activate(model);
  }
}

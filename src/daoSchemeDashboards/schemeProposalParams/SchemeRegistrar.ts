import { bindable } from 'aurelia-framework';
import { SchemeProposalParams } from './schemeProposalParams';

export class SchemeRegistrar extends SchemeProposalParams  {

  constructor() {
    super();
  }

  activate(model) {
    model.params.cap= 0;
    model.params.price= 0;
    model.params.startBlock= 0;
    model.params.endBlock= 0;
    model.params.beneficiary= null;
    model.params.admin= null;
    return super.activate(model);
  }
}

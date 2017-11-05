import { bindable } from 'aurelia-framework';
import { SchemeConfigurationBase } from './schemeConfigurationBase';

export class GlobalConstraintRegistrar extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.votePrec = 50;
    model.intVote = null;
    return super.activate(model);
  }
}

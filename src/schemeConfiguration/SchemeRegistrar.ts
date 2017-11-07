import { bindable } from 'aurelia-framework';
import { SchemeConfigurationBase } from './schemeConfigurationBase';

export class SchemeRegistrar extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.registerVoteParams = {};
    model.removeVoteParams = {};
    model.votingMachineInfo=null;
    return super.activate(model);
  }
}

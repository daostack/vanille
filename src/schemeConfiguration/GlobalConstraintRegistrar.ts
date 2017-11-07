import { SchemeConfigurationBase } from './schemeConfigurationBase';

export class GlobalConstraintRegistrar extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.votingMachineInfo = null;
    model.fee = 0;
    return super.activate(model);
  }
}

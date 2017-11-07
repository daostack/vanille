import { SchemeConfigurationBase } from './schemeConfigurationBase';

export class SimpleContributionScheme extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.orgNativeTokenFee = 0
    model.schemeNativeTokenFee = 0;
    model.votingMachineInfo = null;
    return super.activate(model);
  }
}

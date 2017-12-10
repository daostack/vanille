import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator} from './schemeConfigurationBase';

export class NonArcScheme implements SchemeConfigurator  {

model: any;

  constructor(
  ) {
    // super();
  }

  activate(model) {
      model.getConfigurationHash = this.getConfigurationHash.bind(this);
      model.fee = 0;
      model.tokenAddress = undefined;
      model.schemeParametersHash = undefined;
      model.isRegistering = false;
      model.canBeRegisteringScheme = !!model.canBeRegisteringScheme;
      this.model = model;
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this.model.schemeParametersHash;
  }

}

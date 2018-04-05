import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';

export class NonArc implements SchemeConfigurator {

  model: any;

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  async activate(model) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    model.isRegistering = false;
    model._canBeRegisteringScheme = !!model.canBeRegisteringScheme;
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }

}

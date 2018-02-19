import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';
import { SchemeService } from "../services/SchemeService";
import { DaoService } from "../services/DaoService";

export class UnknownArcS implements SchemeConfigurator {

  model: any;

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  activate(model) {
    model.getConfigurationHash = this.getConfigurationHash.bind(this);
    model.isRegistering = false;
    model._canBeRegisteringScheme = !!model.canBeRegisteringScheme;
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }

}

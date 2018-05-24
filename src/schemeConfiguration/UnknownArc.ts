import { autoinject } from 'aurelia-framework';
import { SchemeConfigModel } from './schemeConfigModel';
import { SchemeService } from "../services/SchemeService";
import { DaoService } from "../services/DaoService";

export class UnknownArcS {

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  async activate(model: Partial<SchemeConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }
}

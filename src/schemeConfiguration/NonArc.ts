import { autoinject } from 'aurelia-framework';
import { SchemeConfigModel } from './schemeConfigModel';
import { SchemePermissions } from '../services/ArcService';
import { AureliaHelperService } from '../services/AureliaHelperService';

@autoinject
export class NonArc {

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  constructor(private helper: AureliaHelperService) {
  }

  async activate(model: Partial<SchemeConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }
}

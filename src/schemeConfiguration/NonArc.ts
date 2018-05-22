import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';
import { DefaultSchemePermissions, SchemePermissions } from '../services/ArcService';
import { AureliaHelperService } from '../services/AureliaHelperService';

@autoinject
export class NonArc implements SchemeConfigurator {

  model: any;

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  selectedPermissions: Array<number> = [];

  constructor(private helper: AureliaHelperService) {
    console.log(helper);
  }

  async activate(model) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    model.permissions = model.permissions || DefaultSchemePermissions.NoPermissions;
    this.model = model;

    this.helper.createArrayWatch(this.selectedPermissions, () => {
      setTimeout(() => {
        this.model.permissions = this.selectedPermissions.reduce(
          (previousValue: number, currentValue: number) => previousValue | currentValue);
      }, 0)
    });
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }
}

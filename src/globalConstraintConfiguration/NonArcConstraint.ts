import { autoinject } from 'aurelia-framework';
import { GlobalConstraintConfigModel } from './globalConstraintConfigModel';

export class NonArcConstraint {

  /* constraintParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _constraintParametersHash = undefined;

  async activate(model: Partial<GlobalConstraintConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, constraintAddress?: string): Promise<any> {
    return this._constraintParametersHash;
  }

}

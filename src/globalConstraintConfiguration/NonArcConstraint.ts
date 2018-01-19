import { autoinject } from 'aurelia-framework';
import { GlobalConstraintConfig } from "../services/GlobalConstraintService";

export class NonArcConstraint implements GlobalConstraintConfig {

  model: any;

  constructor(
  ) {
    // super();
  }

  /* constraintParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _constraintParametersHash = undefined;

  activate(model) {
    model.getConfigurationHash = this.getConfigurationHash.bind(this);
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, constraintAddress?: string): Promise<any> {
    return this._constraintParametersHash;
  }

}

import { autoinject } from 'aurelia-framework';
import { SchemePermissions } from '../services/ArcService';
import { AureliaHelperService } from '../services/AureliaHelperService';
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

@autoinject
export class NonArc {

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  constructor(private helper: AureliaHelperService) {
  }

  async activate(model: Partial<VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }
}

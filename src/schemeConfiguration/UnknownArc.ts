import { autoinject } from 'aurelia-framework';
import { SchemeService } from "../services/SchemeService";
import { DaoService } from "../services/DaoService";
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';

export class UnknownArcS {

  /* schemeParametersHash doesn't go into the model, rather it is obtained
     by the call to getConfigurationHash */
  _schemeParametersHash = undefined;

  async activate(model: Partial<VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return this._schemeParametersHash;
  }
}

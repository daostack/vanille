import { autoinject } from "aurelia-framework";
import { Hash } from "../services/ArcService";
import { VotingMachineConfigModel } from './votingMachineConfigModel';

@autoinject
export class Unknown {

  vmParametersHash: Hash = "";

  async activate(model: VotingMachineConfigModel) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
  }

  private async getConfigurationHash(orgAddress: string, votingMachineAddress?: string): Promise<any> {
    return Promise.resolve(this.vmParametersHash);
  }
}

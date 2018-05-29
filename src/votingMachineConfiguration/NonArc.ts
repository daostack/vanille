import { autoinject } from "aurelia-framework";
import { Hash } from "../services/ArcService";
import { VotingMachineConfigModel } from './votingMachineConfigModel';

@autoinject
export class Unknown {
  private model: Partial<VotingMachineConfigModel>;

  async activate(model: VotingMachineConfigModel) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    this.model = model;
  }

  private async getConfigurationHash(orgAddress: string, votingMachineAddress?: string): Promise<any> {
    return Promise.resolve(this.model.voteParametersHash);
  }
}

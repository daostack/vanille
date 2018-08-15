import { autoinject } from "aurelia-framework";
import { DaoService } from '../services/DaoService';
import { ArcService, AbsoluteVoteParams } from "../services/ArcService";
import { VotingMachineConfigModel } from './votingMachineConfigModel';

@autoinject
export class AbsoluteVote {

  model: Partial<AbsoluteVoteParams> = {};

  constructor(
    private daoService: DaoService
    , private arcService: ArcService
  ) { }

  async activate(model: Partial<AbsoluteVoteParams & VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    /**
     * we want to keep the params in the passed-in model,
     * and add the default values to it.
     */
    Object.assign(this.model,
      {
        votePerc: 50,
        ownerVote: true
      }, model);
  }

  private async getConfigurationHash(orgAddress: string, votingMachineAddress?: string): Promise<any> {

    let dao = await this.daoService.daoAt(orgAddress);

    return await this.arcService.setContractParameters(
      Object.assign(this.model, { reputation: dao.reputation.address }),
      "AbsoluteVote",
      votingMachineAddress);
  }
}

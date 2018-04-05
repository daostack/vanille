import { autoinject } from "aurelia-framework";
import { VotingMachineConfig } from '../services/VotingMachineService';
import { VanilleDAO, DaoService } from '../services/DaoService';
import { ArcService } from "../services/ArcService";

@autoinject
export class AbsoluteVote implements VotingMachineConfig {

  model: any;

  constructor(
    private daoService: DaoService
    , private arcService: ArcService
  ) { }

  async activate(model) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    model.votePerc = model.votePerc !== undefined ? model.votePerc : 50;
    model.ownerVote = model.ownerVote !== undefined ? model.ownerVote : true;
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, votingMachineAddress?: string): Promise<any> {

    let dao = await this.daoService.daoAt(orgAddress);

    return await this.arcService.setContractParameters(
      {
        reputation: dao.reputation.address,
        votePerc: this.model.votePerc,
        ownerVote: this.model.ownerVote,
      },
      "AbsoluteVote",
      votingMachineAddress);
  }
}

import { autoinject } from "aurelia-framework";
import { VotingMachineConfig } from '../services/VotingMachineService';
import { DAO, OrganizationService } from '../services/OrganizationService';
import { ArcService } from  "../services/ArcService";

@autoinject
export class AbsoluteVote implements VotingMachineConfig  {

  model: any;

  constructor(
    private organizationService: OrganizationService
    , private arcService: ArcService
  ) {}

  activate(model) {
    model.getConfigurationHash = this.getConfigurationHash.bind(this);
    model.votePrec = model.votePrec !== undefined ? model.votePrec : 50;
    model.ownerVote = model.ownerVote !== undefined ? model.ownerVote : true;
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, votingMachineAddress?: string): Promise<any> {

    let dao = await this.organizationService.organizationAt(orgAddress);
      
    return await this.arcService.setContractParameters(
      {
        reputation: dao.reputation.address,
        votePrec: this.model.votePrec,
        ownerVote: this.model.ownerVote,
      },
      "AbsoluteVote",
      votingMachineAddress);
  }
}

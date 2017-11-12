import { VotingMachineConfig } from '../services/VotingMachineService';
import { TruffleContract } from '../services/ArcService';
import { Organization } from '../services/OrganizationService';

export class AbsoluteVote implements VotingMachineConfig  {

  model: any;

  activate(model) {
    model.getVoteParametersHash = this.getVoteParametersHash.bind(this);
    model.votePrec = model.votePrec !== undefined ? model.votePrec : 50;
    model.ownerVote = model.ownerVote !== undefined ? model.ownerVote : true;
    this.model = model;
  }

  public async getVoteParametersHash(
    votingMachine: TruffleContract,
    org: Organization) {
      
    return await votingMachine.getParametersHash(org.reputation.address, this.model.votePrec, this.model.ownerVote);
  }
}

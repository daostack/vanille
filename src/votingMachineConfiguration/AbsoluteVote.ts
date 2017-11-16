import { VotingMachineConfig } from '../services/VotingMachineService';
import { TruffleContract } from '../services/ArcService';
import { DAO } from '../services/OrganizationService';

export class AbsoluteVote implements VotingMachineConfig  {

  model: any;

  activate(model) {
    model.getHash = this.getHash.bind(this);
    model.votePrec = model.votePrec !== undefined ? model.votePrec : 50;
    model.ownerVote = model.ownerVote !== undefined ? model.ownerVote : true;
    this.model = model;
  }

  public async getHash(
    votingMachine: TruffleContract,
    org: DAO) {
      
    return await votingMachine.getParametersHash(org.reputation.address, this.model.votePrec, this.model.ownerVote);
  }
}

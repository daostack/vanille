import { VotingMachineConfig } from '../services/VotingMachineService';
import { TruffleContract } from '../services/ArcService';
import { Organization } from '../services/OrganizationService';

export class AbsoluteVote implements VotingMachineConfig  {

  votePrec = 50;
  ownerVote = true;

  activate(model) {
    model.getVoteParametersHash = this.getVoteParametersHash.bind(this);
  }

  public async getVoteParametersHash(
    votingMachine: TruffleContract,
    org: Organization) {
      
    return await votingMachine.getParametersHash(org.reputation.address, this.votePrec, this.ownerVote);
  }
}

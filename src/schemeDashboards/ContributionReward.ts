import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, ContributionRewardWrapper, ProposeContributionRewardParams, ContributionProposal, IntVoteInterfaceWrapper, BinaryVoteResult } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { BigNumber } from '../services/Web3Service';

@autoinject
export class ContributionRewardDashboard extends DaoSchemeDashboard {

  nativeTokenReward: BigNumber = new BigNumber(0);
  description: string;
  ethReward: BigNumber = new BigNumber(0);
  externalTokenReward: BigNumber = new BigNumber(0);
  reputationTokenReward: BigNumber = new BigNumber(0);
  externalTokenAddress: string = ""; // need a default value for solidity
  beneficiaryAddress: string;
  periodLength: number = 1;
  numberOfPeriods: number = 1;
  proposals: Array<ContributionProposal>;
  votingMachine: IntVoteInterfaceWrapper;
  wrapper: ContributionRewardWrapper;
  checkingForProposals: boolean = false;

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async attached() {
    this.wrapper = await this.arcService.getContract("ContributionReward") as ContributionRewardWrapper;
    this.votingMachine = await this.wrapper.getVotingMachine(this.orgAddress);
    return this.refreshProposals();
  }

  async refreshProposals() {
    this.checkingForProposals = true;
    const fetcher = (await this.wrapper.getVotableProposals(this.orgAddress))({}, { fromBlock: 0 });
    this.proposals = await fetcher.get();
    this.checkingForProposals = false;
  }

  async vote(proposal: ContributionProposal, vote: BinaryVoteResult) {
    try {
      const result = await this.votingMachine.vote({
        proposalId: proposal.proposalId,
        vote
      });
      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Vote ${BinaryVoteResult[vote]} submitted`, result.tx));

      this.checkingForProposals = true;
      result.watchForTxMined().then(() => { this.refreshProposals(); });
    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error voting`, ex));
    }
  }

  async execute(proposal: ContributionProposal, vote: BinaryVoteResult) {
    try {
      const result = await this.votingMachine.execute({
        proposalId: proposal.proposalId
      });
      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Execute attempted`, result.tx));

      this.checkingForProposals = true;
      result.watchForTxMined().then(() => { this.refreshProposals(); });
    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error voting`, ex));
    }
  }

  async proposeContributionReward() {
    try {
      let options: ProposeContributionRewardParams = {
        avatar: this.orgAddress,
        description: this.description,
        nativeTokenReward: this.nativeTokenReward, // amount of contribution in native tokens
        reputationChange: this.reputationTokenReward, // amount of contribution to reputation
        ethReward: this.ethReward, // amount of contribution in Wei
        beneficiaryAddress: this.beneficiaryAddress,
        periodLength: 1,
        numberOfPeriods: 1
      };

      if (this.externalTokenReward) {
        options.externalToken = this.externalTokenAddress;
        options.externalTokenReward = this.externalTokenReward; // amount of contribution in terms of the given external token
      }

      let result = await this.wrapper.proposeContributionReward(options);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to make a contribution', result.tx));

      this.checkingForProposals = true;

      result.watchForTxMined().then(() => { this.refreshProposals(); });

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to make a contribution`, ex));
    }
  }
}

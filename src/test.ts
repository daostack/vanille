import { EventAggregator } from '../node_modules/aurelia-event-aggregator';
import { autoinject } from '../node_modules/aurelia-framework';
import {
  ArcService,
  ContributionRewardWrapper,
  GenesisProtocolWrapper,
  BinaryVoteResult,
  Address,
  ContractWrapperBase
} from "./services/ArcService";
import { DaoService, VanilleDAO } from './services/DaoService';
import { Web3Service, BigNumber } from './services/Web3Service';
import { EventConfigTransaction } from './entities/GeneralEvents';

@autoinject
export class Test {
  constructor(
    private eventAggregator: EventAggregator,
    private arcService: ArcService,
    private daoService: DaoService,
    private web3Service: Web3Service
  ) {
  }

  // private stakingTokenBalance: BigNumber;
  private dao: VanilleDAO;
  private contributionReward: ContributionRewardWrapper;
  private defaultAccount: Address;
  private votingMachineAddress: Address;
  private votingMachine: GenesisProtocolWrapper;
  private stakingToken: any;

  async attached() {
    if ((this.web3Service.networkName === "Live") || (this.web3Service.networkName === "Kovan")) {
      return;
    }

    this.dao = (await this.daoService.allDAOs())[0]; // assuming Genesis DAO on ganache
    this.contributionReward = this.arcService.arcContracts.ContributionReward;
    this.defaultAccount = this.web3Service.accounts[0];

    this.votingMachineAddress = await this.contributionReward.getVotingMachineAddress(this.dao.address);

    this.votingMachine =
      (await this.arcService.arcContracts.GenesisProtocol.factory.at(this.votingMachineAddress)) as GenesisProtocolWrapper;

    const tokenAddress = await this.votingMachine.contract.stakingToken();
    this.stakingToken = await (await this.arcService.getContract("DAOToken", tokenAddress));
  }

  async stakeWithApproval() {
    try {
      const proposalResult = await this.contributionReward.proposeContributionReward(
        {
          avatar: this.dao.address,
          beneficiaryAddress: this.defaultAccount,
          description: "A new contribution",
          numberOfPeriods: 1,
          periodLength: 1,
          reputationChange: this.web3Service.web3.utils.toWei(1)
        });

      const proposalId = await proposalResult.getProposalIdFromMinedTx();

      const stakingTokenBalance = await this.stakingToken.balanceOf(this.defaultAccount);

      if (stakingTokenBalance.eq(0)) {
        await this.stakingToken.mint(this.defaultAccount, this.web3Service.web3.utils.toWei(1000));
      }

      // this.stakingTokenBalance = await this.stakingToken.balanceOf(this.defaultAccount);

      const result = await (await this.votingMachine.stakeWithApproval({
        amount: this.web3Service.web3.utils.toWei(1),
        proposalId,
        vote: BinaryVoteResult.Yes,
      })).watchForTxMined();

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'stakeWithApproval', result.transactionHash));
    } catch (ex) {
      this.eventAggregator.publish("handleException", ex);
    }
  }
}

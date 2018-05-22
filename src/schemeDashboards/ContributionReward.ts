import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, ContributionRewardWrapper, ProposeContributionRewardParams } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { BigNumber } from '../services/Web3Service';

@autoinject
export class ContributionRewardDashboard extends DaoSchemeDashboard {

  nativeTokenReward: BigNumber = new BigNumber(0);
  description: string;
  ethReward: BigNumber = new BigNumber(0);
  externalTokenReward: BigNumber = new BigNumber(0);
  reputationTokenReward: BigNumber = new BigNumber(0);
  externalTokenAddress: string;
  beneficiaryAddress: string;
  periodLength: number = 1;
  numberOfPeriods: number = 1;

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeContributionReward() {
    try {
      const scheme = await this.arcService.getContract("ContributionReward") as ContributionRewardWrapper;
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

      let result = await scheme.proposeContributionReward(options);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to make a contribution', result.tx.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to make a contribution`, ex));
    }
  }
}

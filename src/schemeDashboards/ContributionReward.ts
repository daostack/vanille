import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";

@autoinject
export class ContributionReward extends DaoSchemeDashboard {

  nativeTokenReward: Number = 0;
  description: string;
  ethReward: Number = 0;
  externalTokenReward: Number = 0;
  reputationTokenReward: Number = 0;
  externalTokenAddress: string;
  beneficiaryAddress: string;

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeContributionReward() {
    try {
      const scheme = await this.arcService.getContract("ContributionReward");
      let options: any = {
        avatar: this.orgAddress,
        description: this.description,
        nativeTokenReward: this.nativeTokenReward, // amount of contribution in native tokens
        reputationReward: this.reputationTokenReward, // amount of contribution to reputation
        ethReward: this.ethReward, // amount of contribution in Wei
        beneficiary: this.beneficiaryAddress
      };

      if (this.externalTokenReward) {
        options.externalToken = this.externalTokenAddress;
        options.externalTokenReward = this.externalTokenReward; // amount of contribution in terms of the given external token
      }

      let tx = await scheme.proposeContributionReward(options);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to make a contribution', tx.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to make a contribution`, ex));
    }
  }
}

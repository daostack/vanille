import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";

@autoinject
export class SimpleContributionScheme extends DaoSchemeDashboard {

  nativeTokenReward: Number = 0;
  description: string;
  ethReward: Number = 0;
  externalTokenReward: Number = 0;
  reputationTokenReward: Number = 0;
  externalTokenAddress: string;
  beneficiaryAddress: string;

  constructor(
    // private schemeService: SchemeService
    // , private arcService: ArcService
    // , private organizationService: OrganizationService
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeContribution() {
    try {
      const scheme = await this.arcService.getContract("SimpleContributionScheme");
      let tx = await scheme.submitContribution( {
          avatar: this.orgAddress,
          description: this.description,
          nativeTokenReward: this.nativeTokenReward, // amount of contribution in native tokens
          reputationReward: this.reputationTokenReward, // amount of contribution to reputation
          ethReward: this.ethReward, // amount of contribution in ethers
          externalToken: this.externalTokenAddress, 
          externalTokenReward: this.externalTokenReward, // amount of contribution in terms of the given external token
          beneficiary: this.beneficiaryAddress
        }
      );
       this.eventAggregator.publish("handleSuccess", `Proposal submitted for contribution to ${this.beneficiaryAddress}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       // this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}
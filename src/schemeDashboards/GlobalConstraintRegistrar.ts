import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { GlobalConstraintInfo } from "../services/GlobalConstraintService";
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { EventConfigTransaction } from "../entities/GeneralEvents";

@autoinject
export class GlobalConstraintRegistrar extends DaoSchemeDashboard {

  constraintToAddInfo: GlobalConstraintInfo;
  constraintToRemoveInfo: GlobalConstraintInfo;
  constraintToAddConfig: any = {};
  votingMachineInfo: VotingMachineInfo= null;
  votingMachineConfig: VotingMachineConfig = <any>{};

  constructor(
    // private schemeService: SchemeService
    // , private arcService: ArcService
    // , private organizationService: OrganizationService
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar");
      const globalConstraintParametersHash = await this.constraintToAddConfig.getConfigurationHash(this.orgAddress, this.constraintToAddInfo.address);
      const contrainRemovalVotingMachineInfoHash = await this.votingMachineConfig.getConfigurationHash(this.orgAddress, this.votingMachineInfo.address);

      let tx = await scheme.proposeGlobalConstraint(
      {
          avatar: this.orgAddress
          , globalConstraint: this.constraintToAddInfo.address
          , globalConstraintParametersHash: globalConstraintParametersHash
          , votingMachineHash: contrainRemovalVotingMachineInfoHash
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.constraintToAddInfo.name}`, tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async unProposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar");

      let tx = await scheme.proposeToRemoveGlobalConstraint(
      {
          avatar: this.orgAddress
          , globalConstraint: this.constraintToRemoveInfo.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.constraintToRemoveInfo.name}`, tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

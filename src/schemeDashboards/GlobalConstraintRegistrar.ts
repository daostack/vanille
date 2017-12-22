import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService, GlobalConstraintRegistrar } from  "../services/ArcService";
import { GlobalConstraintInfo } from "../services/GlobalConstraintService";
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";

@autoinject
export class GlobalConstraintRegistrarDashboard extends DaoSchemeDashboard {

  constraintToAddInfo: GlobalConstraintInfo;
  constraintToRemoveInfo: GlobalConstraintInfo;
  constraintToAddConfig: any = {};
  votingMachineInfo: VotingMachineInfo= null;
  votingMachineConfig: VotingMachineConfig = <any>{};

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrar;
      const globalConstraintParametersHash = await this.constraintToAddConfig.getConfigurationHash(this.orgAddress, this.constraintToAddInfo.address);
      const contrainRemovalVotingMachineInfoHash = await this.votingMachineConfig.getConfigurationHash(this.orgAddress, this.votingMachineInfo.address);

      let tx = await scheme.proposeToAddModifyGlobalConstraint(
      {
          avatar: this.orgAddress
          , globalConstraint: this.constraintToAddInfo.address
          , globalConstraintParametersHash: globalConstraintParametersHash
          , votingMachineHash: contrainRemovalVotingMachineInfoHash
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.constraintToAddInfo.address}`, tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to add/modify constraint ${this.constraintToAddInfo.address}`, ex));
    }
  }

  async unProposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrar;

      let tx = await scheme.proposeToRemoveGlobalConstraint(
      {
          avatar: this.orgAddress
          , globalConstraint: this.constraintToRemoveInfo.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.constraintToRemoveInfo.address}`, tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to remove constraint ${this.constraintToRemoveInfo.address}`, ex));
    }
  }
}

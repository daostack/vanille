import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { GlobalConstraintInfo, GlobalConstraintService } from "../services/GlobalConstraintService";
import { VotingMachineService, VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
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
    , private votingMachineService: VotingMachineService
    , private globalConstraintService: GlobalConstraintService
  ) {
    super();
  }

  async proposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar");
      const globalConstraintConfigHash = await this.globalConstraintService.getGlobalConstraintConfigHash(this.orgAddress, this.constraintToAddInfo, this.constraintToAddConfig);
      const contrainRemovalVotingMachineInfoHash = await this.votingMachineService.getVotingMachineConfigHash(this.orgAddress, this.votingMachineInfo, this.votingMachineConfig );
      let tx = await scheme.proposeGlobalConstraint(this.orgAddress,
        this.constraintToAddInfo.address,
         globalConstraintConfigHash,
         contrainRemovalVotingMachineInfoHash);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.constraintToAddInfo.name}`, tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async unProposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar");

      let tx = await scheme.proposeToRemoveGC(this.orgAddress, this.constraintToRemoveInfo.address);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.constraintToRemoveInfo.name}`, tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

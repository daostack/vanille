import { autoinject, computedFrom, observable } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, GlobalConstraintRegistrar } from "../services/ArcService";
import { GlobalConstraintInfo } from "../services/GlobalConstraintService";
import { VotingMachineInfo, VotingMachineConfig } from '../services/VotingMachineService';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcConstraintItemName } from 'resources/customElements/GlobalConstraintsDropdown/globalConstraintsDropdown';

@autoinject
export class GlobalConstraintRegistrarDashboard extends DaoSchemeDashboard {

  constraintToAddAddress: string;
  constraintToRemoveInfo: GlobalConstraintInfo;
  constraintToAddConfig: any = {};
  votingMachineInfo: VotingMachineInfo = null;
  votingMachineConfig: VotingMachineConfig = <any>{};
  @observable currentGCSelection: GlobalConstraintInfo = null;
  addressControl: HTMLElement;

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  currentGCSelectionChanged() {
    if (this.currentGCSelection) {
      this.constraintToAddAddress = this.currentGCSelection.address;
    } else {
      this.constraintToAddAddress = undefined;
    }
    if (this.constraintToAddAddress) {
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
    } else {
      $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
    }
  }

  @computedFrom("currentGCSelection")
  get isNonArcScheme() {
    return this.currentGCSelection && (this.currentGCSelection.name === NonArcConstraintItemName);
  }

  async proposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrar;
      const globalConstraintParametersHash = await this.constraintToAddConfig.getConfigurationHash(this.orgAddress, this.currentGCSelection.address);
      const constraintRemovalVotingMachineInfoHash = await this.votingMachineConfig.getConfigurationHash(this.orgAddress, this.votingMachineInfo.address);

      const config = {
        avatar: this.orgAddress
        , globalConstraint: this.constraintToAddAddress
        , globalConstraintParametersHash: globalConstraintParametersHash
        , votingMachineHash: constraintRemovalVotingMachineInfoHash
      };

      let result = await scheme.proposeToAddModifyGlobalConstraint(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.constraintToAddAddress}`, result.tx.tx));

      this.currentGCSelection = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to add/modify constraint ${this.constraintToAddAddress}`, ex));
    }
  }

  async proposeRemoveConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrar;

      let result = await scheme.proposeToRemoveGlobalConstraint(
        {
          avatar: this.orgAddress
          , globalConstraint: this.constraintToRemoveInfo.address
        });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.constraintToRemoveInfo.address}`, result.tx.tx));

      this.constraintToRemoveInfo = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to remove constraint ${this.constraintToRemoveInfo.address}`, ex));
    }
  }
}

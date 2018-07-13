import { autoinject, computedFrom, observable } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import {
  ArcService
  , GlobalConstraintRegistrarWrapper
  , ProposeToAddModifyGlobalConstraintParams,
  Address
} from "../services/ArcService";
import { GlobalConstraintInfo } from "../services/GlobalConstraintService";
import { VotingMachineInfo } from '../services/VotingMachineService';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcConstraintItemName } from 'resources/customElements/GlobalConstraintsDropdown/globalConstraintsDropdown';
import { VotingMachineConfigModel } from '../votingMachineConfiguration/votingMachineConfigModel';
import { GlobalConstraintConfigModel } from 'globalConstraintConfiguration/globalConstraintConfigModel';

@autoinject
export class GlobalConstraintRegistrarDashboard extends DaoSchemeDashboard {

  constraintToAddAddress: Address;
  constraintToRemoveInfo: GlobalConstraintInfo;
  constraintToAddConfig: Partial<GlobalConstraintConfigModel> = {};
  votingMachineInfo: VotingMachineInfo = null;
  votingMachineConfig: Partial<VotingMachineConfigModel> = {};
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

    // gcParams = await this.currentGCSelection.getSchemeParameters();
  }

  @computedFrom("currentGCSelection")
  get isNonArcScheme() {
    return this.currentGCSelection && (this.currentGCSelection.name === NonArcConstraintItemName);
  }

  async proposeConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrarWrapper;
      const globalConstraintParametersHash = await this.constraintToAddConfig.getConfigurationHash(this.orgAddress, this.currentGCSelection.address);
      const constraintRemovalVotingMachineInfoHash = await this.votingMachineConfig.getConfigurationHash(this.orgAddress, this.votingMachineInfo.address);

      const config: ProposeToAddModifyGlobalConstraintParams = {
        avatar: this.orgAddress
        , globalConstraint: this.constraintToAddAddress
        , globalConstraintParametersHash: globalConstraintParametersHash
        , votingMachineHash: constraintRemovalVotingMachineInfoHash
      };

      let result = await scheme.proposeToAddModifyGlobalConstraint(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.constraintToAddAddress}`, result.tx));

      this.currentGCSelection = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to add/modify constraint ${this.constraintToAddAddress}`, ex));
    }
  }

  async proposeRemoveConstraint() {
    try {
      const scheme = await this.arcService.getContract("GlobalConstraintRegistrar") as GlobalConstraintRegistrarWrapper;

      let result = await scheme.proposeToRemoveGlobalConstraint(
        {
          avatar: this.orgAddress
          , globalConstraintAddress: this.constraintToRemoveInfo.address
        });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.constraintToRemoveInfo.address}`, result.tx));

      this.constraintToRemoveInfo = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to remove constraint ${this.constraintToRemoveInfo.address}`, ex));
    }
  }
}

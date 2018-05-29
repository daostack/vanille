import { bindable, customElement, bindingMode } from 'aurelia-framework';
import { VotingMachineInfo } from '../../../services/VotingMachineService';
import { VotingMachineConfigModel } from '../../../votingMachineConfiguration/votingMachineConfigModel';
import { Address } from '@daostack/arc.js';

@customElement("votingmachineselector")
export class VotingMachineSelector {

  /**
   * becomes whatever is selected by the dropdown.
   * default is set by the dropdown
   */
  @bindable({ defaultBindingMode: bindingMode.twoWay })
  votingMachineInfo: VotingMachineInfo;
  /**
   * configuration of the selected voting machine
   */
  @bindable({ defaultBindingMode: bindingMode.twoWay })
  votingMachineConfig: VotingMachineConfigModel;

  @bindable includeUnknownVotingMachine: boolean = false;

  @bindable defaultVotingMachineAddress: Address;

  addressControl: HTMLElement;

  async votingMachineInfoChanged() {

    // if (this.votingMachineInfo) {
    //   this.votingMachineInfo.address = this.votingMachineInfo.address;
    // } else {
    //   this.votingMachineAddress = null;
    // }

    if (this.votingMachineInfo && this.votingMachineInfo.address) {
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
    } else {
      $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
    }
  }
}

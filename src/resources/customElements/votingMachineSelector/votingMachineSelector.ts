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
}

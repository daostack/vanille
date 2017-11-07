import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { VotingMachineService, VotingMachineInfo } from  "../../../services/VotingMachineService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class VotingMachinesDropdown {

  @bindable( { defaultBindingMode: bindingMode.twoWay }) machine: VotingMachineInfo;

  machines: Array<VotingMachineInfo>;

  constructor(
    private votingMachinesService: VotingMachineService    
  ) {
  }

  async attached() {
    this.machines = await this.votingMachinesService.votingMachines;
    this.machine = this.votingMachinesService.defaultMachine;
  }
    
  onItemClick(machine) {
    this.machine = machine;
  }
}

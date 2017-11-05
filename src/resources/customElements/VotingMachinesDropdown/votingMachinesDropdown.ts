import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { VotingMachineService, VotingMachineInfo } from  "../../../services/VotingMachineService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class VotingMachinesDropdown {

  @bindable( { defaultBindingMode: bindingMode.twoWay }) machine: VotingMachineInfo;
  // @bindable( { defaultBindingMode: bindingMode.oneTime }) daoAddress: string;
  // @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeRegistered: boolean = false;
  // @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeUnRegistered: boolean = false;
  // @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeKeys: Array<string> = [];

  machines: Array<VotingMachineInfo>;

  constructor(
    private votingMachinesService: VotingMachineService    
  ) {
  }

  async attached() {
    this.machines = await this.votingMachinesService.votingMachines
  }
    
  onItemClick(machine) {
    this.machine = machine;
  }
}

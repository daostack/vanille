import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { VotingMachineService, VotingMachineInfo } from "../../../services/VotingMachineService";
import { Address } from '../../../services/ArcService';

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class VotingMachinesDropdown {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) machine: VotingMachineInfo;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) includeUnknownVotingMachine: boolean = false;
  @bindable defaultVotingMachineAddress: Address;

  machines: Map<Address, VotingMachineInfo>;

  constructor(
    private votingMachinesService: VotingMachineService
  ) {
  }

  private defaultVotingMachineAddressChanged() {
    if (this.machines) {
      this.machine = this.defaultVotingMachineAddress ?
        this.machines.get(this.defaultVotingMachineAddress) :
        this.votingMachinesService.defaultMachine;
    }
  }

  attached() {
    this.machines = new Map<Address, VotingMachineInfo>();

    this.votingMachinesService.votingMachines.forEach((vm) => {
      this.machines.set(vm.address, vm);
    });

    if (this.includeUnknownVotingMachine) {

      let nonArcSchemeItem = new VotingMachineInfo();
      nonArcSchemeItem.friendlyName = "Unknown Voting Machine";
      nonArcSchemeItem.name = UnknownVotingMachineItemName;
      nonArcSchemeItem.address = null;

      this.machines.set(null, nonArcSchemeItem);
    }

    this.defaultVotingMachineAddressChanged();
  }

  onItemClick(machine) {
    this.machine = machine;
  }
}

export const UnknownVotingMachineItemName = "Unknown";

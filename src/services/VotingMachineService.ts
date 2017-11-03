import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
// import { OrganizationService, DAO, DaoSchemeInfo } from '../services/OrganizationService';
// import { Permissions, ToPermissionsEnum } from '../services/ControllerService';

@autoinject
export class VotingMachineService {

/**
 * The Arc voting machine that we make available to the user
 */
public availableVotingMachines: Array<ContractInfo>;

constructor(
  private arcService: ArcService
) {
    this.availableVotingMachines = [
      this.arcService.arcSchemes.AbsoluteVote
    ];
  }
}

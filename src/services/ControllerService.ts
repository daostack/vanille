import { autoinject } from "aurelia-framework";
// import { DaoSchemeDashboard } from "../daoSchemeDashboards/daoSchemeDashboard";

@autoinject
export class ControllerService {

  constructor(
  ) {
  }
}

// All 0: Not registered,
// 1st bit: Flag if the scheme is registered,
// 2nd bit: Scheme can register other schemes
// 3th bit: Scheme can add/remove global constraints
// 4rd bit: Scheme can upgrade the controller
// export enum Permissions {
//   None=0,
//   NotRegistered = 0,
//   Registered = 1 << 0,
//   CanRegisterOtherSchemes = 1 << 1, 
//   CanAddRemoveGlobalConstraints = 1 << 2,
//   CanUpgradeController = 1 << 3, 
//   All = ~(~0 << 4)  // all four bits
// }


// export function ToPermissionsEnum(str: string): Permissions {
//   if (!str) { return Permissions.None; }
//   return Number(str) as Permissions;
// }

// convert a decimal number to a string containing the binary representation of the number
// function dec2bin(dec){
//   return (dec >>> 0).toString(2);
// }
// pad it
// web3.padLeft(dec2bin(num)),32)

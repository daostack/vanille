import { autoinject } from "aurelia-framework";
import { SchemePermissions } from './ArcService';

@autoinject
export class ControllerService {

  constructor(
  ) {
  }
}

export function ToPermissionsEnum(str: string): SchemePermissions {
  return SchemePermissions.fromString(str);
}

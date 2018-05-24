import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { AureliaHelperService } from '../../../services/AureliaHelperService';
import { SchemePermissions } from '../../../services/ArcService';
import { Event } from '_debugger';

@autoinject
export class SchemePermissionsSelector {

  private selectedPermissions: Array<string> = [];
  // private subscription;
  // private internalUpdates: boolean = false;

  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public permissions: SchemePermissions = SchemePermissions.None;

  constructor(private helper: AureliaHelperService) {
  }

  permissionsChanged() {
    for (let i = 0; i < 16; ++i) {
      const flag = 1 << i;
      const hasFlag = this.permissions & flag;
      const ndx = this.selectedPermissions.indexOf(flag.toString());
      const flagIsSelected = ndx !== -1;
      if (hasFlag && !flagIsSelected) {
        this.selectedPermissions.push(flag.toString());
      } else if (!hasFlag && flagIsSelected) {
        this.selectedPermissions.splice(ndx, 1);
      }
    }
  }

  selectionChanged(event: any) {
    const value = Number(event.target.value);
    const checked = event.target.checked;
    this.permissions = checked ? this.permissions | value : this.permissions & ~value;
  }
}

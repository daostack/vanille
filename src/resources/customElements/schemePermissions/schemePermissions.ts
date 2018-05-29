import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { AureliaHelperService } from '../../../services/AureliaHelperService';
import { SchemePermissions } from '../../../services/ArcService';
import { Event } from '_debugger';

@autoinject
export class SchemePermissionsSelector {

  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public permissions: SchemePermissions = SchemePermissions.None;

  private internalPermissions: SchemePermissions = SchemePermissions.None;
  private selectedPermissions: Array<string> = [];
  private view;

  constructor(private helper: AureliaHelperService) {
  }

  permissionsChanged(newValue: SchemePermissions, oldValue: SchemePermissions): void {
    if (newValue !== oldValue) {
      this.bindPermissions(newValue);
    }
  }

  selectionChanged(event: any) {
    const value = Number(event.target.value);
    const checked = event.target.checked;
    this.permissions = checked ? this.permissions | value : this.permissions & ~value;
  }

  bindPermissions(perms: SchemePermissions): void {
    const newSelections = new Array<string>();
    for (let i = 0; i < 16; ++i) {
      const flag = 1 << i;
      const hasFlag = perms & flag;
      if (hasFlag) {
        newSelections.push(flag.toString());
      }
    }

    this.selectedPermissions = newSelections;

    // for (let i = 0; i < 16; ++i) {
    //   const flag = 1 << i;
    //   const hasFlag = perms & flag;
    //   const cb = this.view.find(`input#${flag}`);
    //   const flagIsSelected = cb.is(':checked');
    //   if (hasFlag && !flagIsSelected) {
    //     cb.prop('checked', true);
    //   } else if (!hasFlag && flagIsSelected) {
    //     cb.prop('checked', false);
    //   }
    // }
  }
}

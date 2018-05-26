import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { AureliaHelperService } from '../../../services/AureliaHelperService';
import { SchemePermissions } from '../../../services/ArcService';
import { Event } from '_debugger';

@autoinject
export class SchemePermissionsSelector {

  private selectedPermissions: Array<string> = [];
  private view;
  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public permissions: SchemePermissions = SchemePermissions.None;

  constructor(private helper: AureliaHelperService) {
  }

  created(ownerView, thisView) {
    this.view = $(thisView).children();

  }
  permissionsChanged(newValue, oldValue) {
    for (let i = 0; i < 16; ++i) {
      const flag = 1 << i;
      const hasFlag = this.permissions & flag;
      const cb = this.view.find(`input#${flag}`);
      const flagIsSelected = cb.is(':checked');
      if (hasFlag && !flagIsSelected) {
        cb.prop('checked', true);
      } else if (!hasFlag && flagIsSelected) {
        cb.prop('checked', false);
      }
    }
  }

  selectionChanged(event: any) {
    const value = Number(event.target.value);
    const checked = event.target.checked;
    this.permissions = checked ? this.permissions | value : this.permissions & ~value;
  }
}

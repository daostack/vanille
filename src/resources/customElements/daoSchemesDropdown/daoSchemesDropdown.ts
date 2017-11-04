import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { SchemeService, SchemeInfo } from  "../../../services/SchemeService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class DaoSchemesDropdown {

  @bindable( { defaultBindingMode: bindingMode.oneTime }) onSelect: (scheme) => boolean;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) daoAddress: string;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeRegistered: boolean = false;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeUnRegistered: boolean = false;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeKeys: Array<string> = [];

  schemes: Array<SchemeInfo>;

  constructor(
    private schemeService: SchemeService    
  ) {
  }

  async attached() {
    this.schemes = (await this.schemeService.getSchemesForDao(this.daoAddress, true))
      .filter((s: SchemeInfo) => {
        return s.inArc 
          && ((this.excludeKeys.length == 0) || (this.excludeKeys.indexOf(s.key) === -1))
          && (!this.excludeRegistered || !s.isRegistered)
          && (!this.excludeUnRegistered || s.isRegistered)
          ;
        })
        ;
  }
    
  onItemClick(scheme) {
    return this.onSelect(scheme);
  }
}

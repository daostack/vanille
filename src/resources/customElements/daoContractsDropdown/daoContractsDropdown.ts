import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { SchemeService, SchemeInfo } from  "../../../services/SchemeService";

@autoinject
export class DaoContractsDropdown {

  // @bindable({ defaultBindingMode: bindingMode.oneTime })
  // schemes: Arra<SchemeInfo> = false;

  constructor(
    private schemeService: SchemeService    
  ) {
  }
}

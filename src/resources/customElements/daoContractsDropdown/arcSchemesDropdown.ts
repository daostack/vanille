import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { SchemeService, DaoSchemeInfo } from  "../../../services/SchemeService";

@autoinject
export class ArcSchemesDropdown {

  // @bindable({ defaultBindingMode: bindingMode.oneTime })
  // // schemes: Arra<SchemeInfo> = false;

  // @bindable
  // onSelect: (scheme) => boolean;
  // schemes: 

  // availableSchemes: Array<DaoSchemeInfo>;
  // removableSchemes: Array<DaoSchemeInfo>;

  // constructor(
  //   private schemeService: SchemeService    
  // ) {

  //   this.availableSchemes = model.allSchemes
  //     .filter((s: DaoSchemeInfo) => s.key && (s.key !== model.key) && !s.isRegistered);
  //   this.removableSchemes = model.allSchemes
  //     .filter((s: DaoSchemeInfo) => s.key && (s.key !== model.key) && s.isRegistered);

  // }
}

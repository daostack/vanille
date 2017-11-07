import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { GlobalConstraintService, GlobalConstraintInfo } from  "../../../services/GlobalConstraintService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class GlobalConstraintsDropdown {

  @bindable( { defaultBindingMode: bindingMode.twoWay }) constraint: GlobalConstraintInfo;

  constraints: Array<GlobalConstraintInfo>;

  constructor(
    private globalConstraintsService: GlobalConstraintService    
  ) {
  }

  async attached() {
    this.constraints = await this.globalConstraintsService.globalConstraints;
    this.constraint = this.globalConstraintsService.defaultConstraint;
  }
    
  onItemClick(constraint) {
    this.constraint = constraint;
  }
}

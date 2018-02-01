import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { GlobalConstraintService, GlobalConstraintInfo } from "../../../services/GlobalConstraintService";
import { OrganizationService, DAO } from "../../../services/OrganizationService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class GlobalConstraintsDropdown {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) constraint: GlobalConstraintInfo;

  /**
   * this is one-way, but in the direction back to the container 
   */
  @bindable({ defaultBindingMode: bindingMode.fromView }) constraints: Array<GlobalConstraintInfo>;

  @bindable({ defaultBindingMode: bindingMode.oneTime }) daoAddress: string;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeRegistered: boolean = false;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeUnregistered: boolean = false;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeKeys: Array<string> = [];
  @bindable({ defaultBindingMode: bindingMode.oneTime }) includeNonArcItem: boolean = false;

  private subscription;

  constructor(
    private globalConstraintsService: GlobalConstraintService
    , private organizationService: OrganizationService
  ) {
  }

  async attached() {

    let dao = await this.organizationService.organizationAt(this.daoAddress);

    this.loadConstraints();

    this.subscription = dao.subscribe(DAO.daoConstraintSetChangedEvent,
      (params: { dao: DAO, constraint: GlobalConstraintInfo }) => {
        this.loadConstraints();
      });
  }

  detached() {
    this.subscription.dispose();
  }

  async loadConstraints() {
    // need to check whether this.scheme exists in list?
    this.constraints = (await this.globalConstraintsService.getGlobalConstraintsForDao(this.daoAddress, true))
      .filter((gc: GlobalConstraintInfo) => {
        return gc.inArc
          && ((this.excludeKeys.length == 0) || (this.excludeKeys.indexOf(gc.name) === -1))
          && (!this.excludeRegistered || !gc.isRegistered)
          && (!this.excludeUnregistered || gc.isRegistered)
          ;
      })
      ;

    if (this.includeNonArcItem) {

      let nonArcSchemeItem = new GlobalConstraintInfo();
      nonArcSchemeItem.friendlyName = "Non-Arc Global Constraint";
      nonArcSchemeItem.name = NonArcConstraintItemName;
      nonArcSchemeItem.isRegistered = false;
      nonArcSchemeItem.address = null;

      this.constraints.unshift(nonArcSchemeItem);
    }
  }

  onItemClick(constraint) {
    this.constraint = constraint;
  }
}

export const NonArcConstraintItemName = "NonArcConstraint";

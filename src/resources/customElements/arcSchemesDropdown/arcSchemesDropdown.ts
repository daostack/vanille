import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { SchemeService, SchemeInfo } from  "../../../services/SchemeService";
import { OrganizationService, DAO } from  "../../../services/OrganizationService";

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class ArcSchemesDropdown {

  @bindable( { defaultBindingMode: bindingMode.twoWay }) scheme: SchemeInfo;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) daoAddress: string;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeRegistered: boolean = false;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeUnregistered: boolean = false;
  @bindable( { defaultBindingMode: bindingMode.oneTime }) excludeKeys: Array<string> = [];
  /**
   * this is one-way, but in the direction back to the container 
   */
  @bindable({ defaultBindingMode: bindingMode.fromView }) schemes: Array<SchemeInfo>;

  subscription;

  constructor(
    private schemeService: SchemeService    
    , private organizationService: OrganizationService    
  ) {
  }

  async attached() {
    let dao = await this.organizationService.organizationAt(this.daoAddress);

    this.loadSchemes();

    this.subscription = dao.subscribe(DAO.daoSchemeSetChangedEvent, 
      (params: { dao:DAO, scheme: SchemeInfo }) => {
        this.loadSchemes();
      }); 
  }

  detached() {
    this.subscription.dispose();
  }

  async loadSchemes() {
    // need to check whether this.scheme exists in list?
    this.schemes = (await this.schemeService.getSchemesForDao(this.daoAddress, true))
      .filter((s: SchemeInfo) => {
        return s.inArc 
          && ((this.excludeKeys.length == 0) || (this.excludeKeys.indexOf(s.key) === -1))
          && (!this.excludeRegistered || !s.isRegistered)
          && (!this.excludeUnregistered || s.isRegistered)
          ;
        })
        ;
  }

  onItemClick(scheme) {
    this.scheme = scheme;
  }
}

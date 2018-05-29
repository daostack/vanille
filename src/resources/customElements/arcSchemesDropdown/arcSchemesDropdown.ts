import { autoinject, bindable, bindingMode, containerless } from "aurelia-framework";
import { SchemeService, SchemeInfo } from "../../../services/SchemeService";
import { DaoService, VanilleDAO } from "../../../services/DaoService";
import { App } from '../../../app';

/**
 * Dropdown for Arc schemes in a given Dao.  Note we don't handle Non-Arc schemes here.
 */
@containerless
@autoinject
export class ArcSchemesDropdown {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) scheme: SchemeInfo;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) daoAddress: string;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeRegistered: boolean = false;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeUnregistered: boolean = false;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeKeys: Array<string> = [];
  @bindable({ defaultBindingMode: bindingMode.oneTime }) includeNonArcItem: boolean = false;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) excludeUnknownArc: boolean = false;

  /**
   * this is one-way, but in the direction back to the container 
   */
  @bindable({ defaultBindingMode: bindingMode.fromView }) schemes: Array<SchemeInfo>;

  private subscription;

  constructor(
    private schemeService: SchemeService
    , private daoService: DaoService
  ) {
  }

  async attached() {
    let dao = await this.daoService.daoAt(this.daoAddress);

    this.loadSchemes();

    this.subscription = dao.subscribe(VanilleDAO.daoSchemeSetChangedEvent,
      (params: { dao: VanilleDAO, scheme: SchemeInfo }) => {
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
          && ((this.excludeKeys.length == 0) || (this.excludeKeys.indexOf(s.name) === -1))
          && (!this.excludeRegistered || !s.isRegistered)
          && (!this.excludeUnknownArc || App.hasDashboard(s.name))
          && (!this.excludeUnregistered || s.isRegistered)
          ;
      })
      ;

    if (this.includeNonArcItem) {

      let nonArcSchemeItem = new SchemeInfo();
      nonArcSchemeItem.friendlyName = "Non-Arc Scheme";
      nonArcSchemeItem.name = NonArcSchemeItemName;
      nonArcSchemeItem.isRegistered = false;
      nonArcSchemeItem.address = null;

      this.schemes.push(nonArcSchemeItem);
    }
  }

  onItemClick(scheme) {
    this.scheme = scheme;
  }
}

export const NonArcSchemeItemName = "NonArc";

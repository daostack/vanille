import { autoinject } from "aurelia-framework";
import { OrganizationService, Organization } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import "./dashboard.scss";
import { PLATFORM } from 'aurelia-pal';

@autoinject
export class DAODashboard {
  
  private org:Organization;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private schemesMap = new Map<string,DashboardSchemeInfo>();
  private get schemes(): Array<DashboardSchemeInfo> { return Array.from(this.schemesMap.values()); }
  
  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private schemeService: SchemeService
    
  ) {
  }

  async activate(options: any) {

    PLATFORM.moduleName("../daoSchemeDashboards/GlobalConstraintRegistrar")
    PLATFORM.moduleName("../daoSchemeDashboards/NonArc")
    PLATFORM.moduleName("../daoSchemeDashboards/NotRegistered")
    PLATFORM.moduleName("../daoSchemeDashboards/SchemeRegistrar")
    PLATFORM.moduleName("../daoSchemeDashboards/SimpleContributionScheme")
    PLATFORM.moduleName("../daoSchemeDashboards/UpgradeScheme")
      
    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    this.tokenSymbol = await this.tokenService.getTokenName(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
    let schemesArray = (await this.schemeService.getSchemesInDao(this.address)).map((s) => { (<DashboardSchemeInfo>s).isRegistered = true; return s as DashboardSchemeInfo; });

    for (let scheme of schemesArray) {
      this.schemesMap.set(scheme.address, scheme);
    }
    /**
     * now merge the list of daos that the org has with daos that it doesn't have
     */

    let availableSchemes = this.schemeService.availableSchemes;
    for (let availableScheme of availableSchemes) {
      let found = this.schemesMap.get(availableScheme.address);
      if (!found) {
        (availableScheme as any).isRegistered = false;
        this.schemesMap.set(availableScheme.address, availableScheme as DashboardSchemeInfo );
      }
    }
    this.schemesMap.set("0xkjhasd789ewkjhrdsyuia", <DashboardSchemeInfo>{ address: "0xkjhasd789ewkjhrdsyuia" });
  }

  attached() {
    ($(".scheme-use-button") as any).tooltip();
    ($(".scheme-delete-button") as any).tooltip();
    ($(".scheme-add-button") as any).tooltip();
    ($(`.collapse`) as any).data("parent","#accordian");
    // workaround for accordian behavior not working.  Check to see if it's fixed when the
    // final version 4 is released
    $('.collapse').on('show.bs.collapse', () =>  {
      ($('.collapse') as any).collapse("hide");
    });
  }

  toggleDashboardVisibility(key) {
    ($(`#${key}`) as any).collapse("toggle");
    setTimeout(() => { ($(`.scheme-use-button`) as any).tooltip("hide"); });
  }

  getDashboardView(scheme: DashboardSchemeInfo):string {
    let key:string;
    if (!scheme.key) {
      key = "NonArc";
    } else if (!scheme.isRegistered) {
      key = "NotRegistered";
    } else {
      key = scheme.key;
    }

    return `../daoSchemeDashboards/${key}`;
  }

  schemeDashboardViewModel(scheme: DashboardSchemeInfo) {
    return Object.assign(scheme, { organization: this.org, orgName: this.orgName, tokenSymbol: this.tokenSymbol })
  }
}

interface DashboardSchemeInfo extends SchemeInfo {
  isRegistered: boolean;
}

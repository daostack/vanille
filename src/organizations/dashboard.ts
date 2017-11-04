import { autoinject, computedFrom } from "aurelia-framework";
import { OrganizationService, DAO } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import "./dashboard.scss";
import { PLATFORM } from 'aurelia-pal';

@autoinject
export class DAODashboard {
  
  private org:DAO;
  private address:string;
  private orgName: string;
  private tokenSymbol: string;
  private userTokenbalance:Number;
  private registeredArcSchemes: Array<SchemeInfo>;
  private unregisteredArcSchemes: Array<SchemeInfo>;
  private nonArcSchemes: Array<SchemeInfo>;
  private arcSchemes: Array<SchemeInfo>;
  // false if adding
  // private state: State = State.Neither;
  // private currentScheme: DaoSchemeInfo;

  // @computedFrom("state")
  // private get using() { return this.state === State.Using; }

  // @computedFrom("state")
  // private get adding() { return this.state === State.Adding; }

  constructor(
    private organizationService: OrganizationService
    , private tokenService: TokenService
    , private arcService: ArcService
    , private schemeService: SchemeService
    
  ) {
  }

  async activate(options: any) {

    // so webpack can find them...
    PLATFORM.moduleName("../daoSchemeDashboards/GlobalConstraintRegistrar")
    PLATFORM.moduleName("../daoSchemeDashboards/NonArc")
    PLATFORM.moduleName("../daoSchemeDashboards/NotRegistered")
    PLATFORM.moduleName("../daoSchemeDashboards/SchemeRegistrar")
    PLATFORM.moduleName("../daoSchemeDashboards/SimpleContributionScheme")
    PLATFORM.moduleName("../daoSchemeDashboards/UpgradeScheme")
      
    this.address = options.address;
    this.org = await this.organizationService.organizationAt(this.address);
    this.orgName = await this.organizationService.organizationName(this.org);
    let token = this.org.token;
    this.tokenSymbol = await this.tokenService.getTokenSymbol(this.org.token);
    this.userTokenbalance = await this.tokenService.getUserTokenBalance(this.org.token);
    /**
     * Get all schemes associated with the DAO.  These can include non-Arc schemes.
     */
    let schemes = await this.schemeService.getSchemesForDao(this.address);

    // add a fake non-Arc scheme
    schemes.push(<SchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    this.registeredArcSchemes =   Array.from(schemes).filter((s: SchemeInfo) => s.inArc && s.inDao);
    this.unregisteredArcSchemes = Array.from(schemes).filter((s: SchemeInfo) => s.inArc && !s.inDao);
    this.nonArcSchemes =          Array.from(schemes).filter((s: SchemeInfo) => !s.inArc);
    this.arcSchemes =             Array.from(schemes).filter((s: SchemeInfo) => s.inArc);
  }

  attached() {
    ($(".scheme-use-button") as any).tooltip();
    ($(`.collapse`) as any).data("parent","#accordian");
    // workaround for accordian behavior not working.  Check to see if it's fixed when the
    // final version 4 is released
    $('.collapse').on('show.bs.collapse', () =>  {
      ($('.collapse') as any).collapse("hide");
    });
  }

  useScheme(scheme: SchemeInfo) {
    this.toggleDashboardVisibility(scheme);
  }

  toggleDashboardVisibility(scheme: SchemeInfo) {
      ($(`#${scheme.key}`) as any).collapse("toggle");
  }

  getDashboardView(scheme: SchemeInfo):string {
      let key:string;
      if (!scheme.inArc) {
        key = "NonArc";
      } else if (!scheme.inDao) {
        key = "NotRegistered";
      } else {
        key = scheme.key;
      }
      return `../daoSchemeDashboards/${key}`;
  }

  schemeDashboardViewModel(scheme: SchemeInfo): any {
      return Object.assign({}, { org: this.org, orgName: this.orgName, orgAddress: this.address, tokenSymbol: this.tokenSymbol, allSchemes: this.arcSchemes }, scheme )
  }
}

enum State {
  Neither,
  Adding,
  Using
}

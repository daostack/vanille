import { autoinject, computedFrom } from "aurelia-framework";
import { OrganizationService, DAO } from "../services/OrganizationService";
import { TokenService } from  "../services/TokenService";
import { ArcService } from  "../services/ArcService";
import { ControllerService, Permissions } from  "../services/ControllerService";
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
  private schemesMap = new Map<string,DashboardSchemeInfo>();
  private registeredArcSchemes: Array<DashboardSchemeInfo>;
  private unregisteredArcSchemes: Array<DashboardSchemeInfo>;
  private nonArcSchemes: Array<DashboardSchemeInfo>;
  private arcSchemes: Array<DashboardSchemeInfo>;
  // false if adding
  // private state: State = State.Neither;
  // private currentScheme: DashboardSchemeInfo;

  // @computedFrom("state")
  // private get using() { return this.state === State.Using; }

  // @computedFrom("state")
  // private get adding() { return this.state === State.Adding; }

  constructor(
    private organizationService: OrganizationService
    , private controllerService: ControllerService
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
     * They are missing isRegistered, which we set here, but they do have permissions (which may be 0 if non-Arc)
     */
    let schemesArray = (await this.schemeService.getSchemesInDao(this.address)).map((s) => Object.assign(s, { isRegistered: true }) as DashboardSchemeInfo);

    for (let scheme of schemesArray) {
      this.schemesMap.set(scheme.address, scheme);
    }
    /**
     * Now merge the list of daos that the org has with daos that it doesn't have
     */
    let availableSchemes = this.schemeService.availableSchemes;
    for (let availableScheme of availableSchemes) {
      let found = this.schemesMap.get(availableScheme.address);
      if (!found) {
        let schemeObtainedFromDAO = schemesArray.filter((s) => s.key == availableScheme.key);
        // These are missing both isRegistered and permissions
        this.schemesMap.set(availableScheme.address, Object.assign(availableScheme, { isRegistered: false, permissions: Permissions.None }) as DashboardSchemeInfo );
      }
    }

    // add a fake non-Arc scheme
    this.schemesMap.set("0x9ac0d209653719c86420bfca5d31d3e695f0b530", <DashboardSchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    this.registeredArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: DashboardSchemeInfo) => s.isRegistered);
    this.unregisteredArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: DashboardSchemeInfo) => s.key && !s.isRegistered);
    this.nonArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: DashboardSchemeInfo) => !s.key);
    this.arcSchemes = Array.from(this.schemesMap.values())
      .filter((s: DashboardSchemeInfo) => s.key);

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

  useScheme(scheme: DashboardSchemeInfo) {
    this.toggleDashboardVisibility(scheme);
  }


  // addScheme(scheme: DashboardSchemeInfo) {
  //   this.toggleDashboardVisibility(scheme, State.Adding);
  // }

  // onAddSchemeSubmit(scheme: DashboardSchemeInfo) {
  //   // this.controllerService.addSchemeToDao(this.org.address, scheme.key, scheme.address);
  // }

  toggleDashboardVisibility(scheme: DashboardSchemeInfo) {
      ($(`#${scheme.key}`) as any).collapse("toggle");


    // let currentState = this.state;

    // if ((newState == currentState) && (currentState != State.Neither)) {
    //   newState = State.Neither;
    // }

    // // let currentScheme = this.currentScheme;
    // // let newScheme = (newState != State.Neither) ? scheme: null;

    // // if (newScheme && (newScheme != currentScheme)) {
    // //   if (currentScheme) {
    // //     ($(`#${currentScheme.key}`) as any).collapse("hide");
    // //   }
    // // }
    // // this.currentScheme = newScheme;

    // this.state = newState;
    
    // // if ((newState == State.Neither) || (currentState == State.Neither) || (newScheme && (newScheme != currentScheme)))  {
    // //   ($(`#${scheme.key}`) as any).collapse("toggle");
    // // }
    // if ((newState == State.Neither) || (currentState == State.Neither))  {
    //   ($(`#${scheme.key}`) as any).collapse("toggle");
    // }
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
    // } else {
    //   return `../daoSchemeDashboards/schemeProposalParams/${scheme.key}`;
    // }
  }

  // canAddScheme(scheme: DashboardSchemeInfo) {
  //   return !scheme.isRegistered && !!scheme.key;
  // }

  schemeDashboardViewModel(scheme: DashboardSchemeInfo): any {
      return Object.assign(scheme, { org: this.org, orgName: this.orgName, tokenSymbol: this.tokenSymbol, allSchemes: this.arcSchemes })
    // } else {
    //   return { org: this.org, params: {} }
    // }
  }

  // removeScheme(scheme: DashboardSchemeInfo) {
  //   // this.controllerService.removeSchemeFromDao(this.org.avatar.address, scheme.key, scheme.address);
  // }
}

export interface DashboardSchemeInfo extends SchemeInfo {
  isRegistered: boolean;
}

enum State {
  Neither,
  Adding,
  Using
}

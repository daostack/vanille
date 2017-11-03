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
  private schemesMap = new Map<string,SchemeInfo>();
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
     */
    let daoShemes = await this.schemeService.getSchemesInDao(this.address);

    /**
     * add to map
     */
    for (let scheme of daoShemes) {
      this.schemesMap.set(scheme.address, scheme);
    }
    /**
     * Now merge the list of schemes that the org has with the available Arc schemes that it doesn't have
     * so that schemesMap contains all the schemes both contained and not contained by the Dao.
     */
    let availableSchemes = this.schemeService.availableSchemes;
    for (let availableScheme of availableSchemes) {
      let isInDao = !!this.schemesMap.get(availableScheme.address);
      if (!isInDao) {
        this.schemesMap.set(availableScheme.address, this.schemeService.contractInfoToSchemeInfo(availableScheme, false));
      }
    }

    // add a fake non-Arc scheme
    this.schemesMap.set("0x9ac0d209653719c86420bfca5d31d3e695f0b530", <SchemeInfo>{ address: "0x9ac0d209653719c86420bfca5d31d3e695f0b530" });

    this.registeredArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: SchemeInfo) => s.inArc && s.inDao);
    this.unregisteredArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: SchemeInfo) => s.inArc && !s.inDao);
    this.nonArcSchemes = Array.from(this.schemesMap.values())
      .filter((s: SchemeInfo) => !s.inArc);
    this.arcSchemes = Array.from(this.schemesMap.values())
      .filter((s: SchemeInfo) => s.inArc);

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

  useScheme(scheme: SchemeInfo) {
    this.toggleDashboardVisibility(scheme);
  }


  // addScheme(scheme: DaoSchemeInfo) {
  //   this.toggleDashboardVisibility(scheme, State.Adding);
  // }

  // onAddSchemeSubmit(scheme: DaoSchemeInfo) {
  //   // this.controllerService.addSchemeToDao(this.org.address, scheme.key, scheme.address);
  // }

  toggleDashboardVisibility(scheme: SchemeInfo) {
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
    // } else {
    //   return `../daoSchemeDashboards/schemeProposalParams/${scheme.key}`;
    // }
  }

  schemeDashboardViewModel(scheme: SchemeInfo): any {
      return Object.assign({}, { org: this.org, orgName: this.orgName, tokenSymbol: this.tokenSymbol, allSchemes: this.arcSchemes }, scheme )
  }
}

enum State {
  Neither,
  Adding,
  Using
}

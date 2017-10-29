import { PLATFORM } from 'aurelia-pal';
import { autoinject, computedFrom } from "aurelia-framework";
import { DaoSchemeDashboard } from "./daoSchemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { DashboardSchemeInfo } from "../organizations/dashboard";

@autoinject
export class SchemeRegistrar extends DaoSchemeDashboard {

  constructor(
    private schemeService: SchemeService
  ) {
    super();
  }

  activate(model) {

    this.availableSchemes = model.allSchemes
      .filter((s: DashboardSchemeInfo) => s.key && (s.key !== model.key) && !s.isRegistered);
    
    // TODO: handle that every params form is using this same params object
    this.proposeParams = { org: model.org, params: {} };

    return super.activate(model);
  }

  // proposeParams = {
  //       cap: 0, // uint _cap,
  //       price: 0, // uint _price,
  //       startBlock: 0, // uint _startBlock,
  //       endBlock: 0, // uint _endBlock,
  //       beneficiary: null, // address _beneficiary,
  //       admin: null,// address _admin)  returns(bytes32) {
  //     };

  proposeParams: any;

  availableSchemes: Array<DashboardSchemeInfo>;
  schemeAddressToRegister: string;
  schemeToPropose: SchemeInfo=null;
  schemeAddressToRemove: string;

  // schemeRegistrarParams:  {
  //   voteRegisterParams:string, // bytes32
  //   voteRemoveParams:string, // bytes32
  //   intVote:string // IntVoteInterface
  // }

  // voteParametersHash: string;

  // async activate(model) {
  //   await super.activate(model);
  //   this.voteParametersHash = await this.org.votingMachine.getParametersHash(this.org.reputation.address, options.votePrec, options.ownerVote);
  // }

  selectSchemeToPropose(scheme: SchemeInfo) {
    this.schemeToPropose = scheme;
  }

  proposeScheme() {
  }

  unProposeScheme() {

  }

  registerDAOInScheme() {

  }

  @computedFrom("schemeToPropose")
  get paramsView() {
    return this.schemeToPropose ? `./schemeProposalParams/${this.schemeToPropose.key}` : undefined;
  }
}

PLATFORM.moduleName("./schemeProposalParams/SimpleContributionScheme")

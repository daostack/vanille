import { PLATFORM } from 'aurelia-pal';
import { autoinject, computedFrom } from "aurelia-framework";
import { DaoSchemeDashboard } from "./daoSchemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import {  } from "../services/SchemeService";

@autoinject
export class SchemeRegistrar extends DaoSchemeDashboard {

  proposeParams: any;
  schemeToPropose: SchemeInfo=null;
  schemeToUnPropose: SchemeInfo=null;

  constructor(
    private schemeService: SchemeService
  ) {
    super();
  }

  activate(model) {
   
    // TODO: handle that every params form is using this same params object
    this.proposeParams = { };

    return super.activate(model);
  }

  // voteParametersHash: string;

  // async activate(model) {
  //   await super.activate(model);
  //   this.voteParametersHash = await this.org.votingMachine.getParametersHash(this.org.reputation.address, options.votePrec, options.ownerVote);
  // }

  proposeScheme() {
  }

  unProposeScheme() {

  }
}

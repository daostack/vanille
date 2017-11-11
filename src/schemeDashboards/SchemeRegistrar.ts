import { PLATFORM } from 'aurelia-pal';
import { autoinject, computedFrom } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { OrganizationService } from '../services/OrganizationService';
import {  } from "../services/SchemeService";
import { ArcService, ContractInfo } from  "../services/ArcService";
import { Permissions } from '../services/ControllerService';
import { EventAggregator  } from 'aurelia-event-aggregator';

@autoinject
export class SchemeRegistrar extends DaoSchemeDashboard {

  proposeParams: any = {};
  schemeToPropose: SchemeInfo=null;
  schemeToUnPropose: SchemeInfo=null;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator

  ) {
    super();
  }

  activate(model) {
    return super.activate(model);
  }

  // voteParametersHash: string;

  // async activate(model) {
  //   await super.activate(model);
  //   this.voteParametersHash = await this.org.votingMachine.getParametersHash(this.org.reputation.address, options.votePrec, options.ownerVote);
  // }

  async proposeScheme() {
  
    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
      const scheme = this.schemeToPropose;
      const params = this.proposeParams;

      const votingMachineInfo = params.votingMachineInfo;
      const voteParametersHash = await this.organizationService.getVoteParametersHash(
          this.orgAddress,
          votingMachineInfo,
          params.votePrec,
          params.ownerVote);

      const parametersHash = await this.schemeService.setSchemeParameters(scheme, 
          Object.assign({}, params, { voteParametersHash: voteParametersHash, votingMachine: votingMachineInfo.address }));
      const permissions = await this.schemeService.getSchemePermissions(scheme);
      const nativeToken = await this.schemeService.getSchemeNativeToken(scheme);
      const fee = await this.schemeService.getSchemeFee(scheme);

      const tx = await schemeRegistrar.proposeScheme(
        this.orgAddress,
        scheme.address,
        parametersHash,
        (permissions & Permissions.CanRegisterOtherSchemes) != 0,
        nativeToken,
        fee,
        true);
        
       this.eventAggregator.publish("handleSuccess", `Proposal submitted successfully, proposalId: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async unProposeScheme() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    const scheme = this.schemeToUnPropose;

    try {
      const tx = await schemeRegistrar.proposeToRemoveScheme(this.orgAddress, scheme.address);
      this.eventAggregator.publish("handleSuccess", `Proposal submitted successfully, proposalId: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

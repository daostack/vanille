import { PLATFORM } from 'aurelia-pal';
import { autoinject, computedFrom } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { OrganizationService } from '../services/OrganizationService';
import { ArcService, ContractInfo } from  "../services/ArcService";
import { Permissions } from '../services/ControllerService';
import { EventAggregator  } from 'aurelia-event-aggregator';
import { SchemeConfigurator} from '../schemeConfiguration/schemeConfigurationBase';

@autoinject
export class SchemeRegistrar extends DaoSchemeDashboard {

  proposeConfiguration: SchemeConfigurator = <any>{};
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

  async proposeScheme() {
  
    try {
      const scheme = await this.arcService.getContract("SchemeRegistrar");
      const contractInfo = this.schemeToPropose as ContractInfo;
      const schemeParametersHash = await this.proposeConfiguration.getConfigurationHash(contractInfo, this.orgAddress);
      const permissions = await this.schemeService.getSchemePermissions(contractInfo);
      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(contractInfo);
      const fee = await this.schemeService.getSchemeFee(contractInfo);

      const tx = await scheme.proposeScheme(
        this.orgAddress,
        contractInfo.address,
        schemeParametersHash,
        (permissions & Permissions.CanRegisterOtherSchemes) != 0,
        nativeTokenAddress,
        fee,
        true);
        
       this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async unProposeScheme() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    const scheme = this.schemeToUnPropose;

    try {
      const tx = await schemeRegistrar.proposeToRemoveScheme(this.orgAddress, scheme.address);
       this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

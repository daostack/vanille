import { PLATFORM } from 'aurelia-pal';
import { autoinject, computedFrom } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { OrganizationService } from '../services/OrganizationService';
import { ArcService, ContractInfo } from  "../services/ArcService";
import { Permissions } from '../services/ControllerService';
import { EventAggregator  } from 'aurelia-event-aggregator';
import { SchemeConfigurator} from '../schemeConfiguration/schemeConfigurationBase';
import { EventConfigTransaction } from "../entities/GeneralEvents";

@autoinject
export class SchemeRegistrar extends DaoSchemeDashboard {

  modifiedSchemeConfiguration: SchemeConfigurator = <any>{};
  schemeToModify: SchemeInfo=null;
  schemeToRemove: SchemeInfo=null;
  newSchemeConfiguration: SchemeConfigurator = <any>{};
  currentSchemeSelection: SchemeInfo=null;
  schemeToAddAddress: string;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator

  ) {
    super();
  }

  useAddress() {
    if (this.currentSchemeSelection)
    {
      this.schemeToAddAddress = this.currentSchemeSelection.address;
    }
  }

  async modifyScheme() {
  
    try {
      const scheme = await this.arcService.getContract("SchemeRegistrar");
      const contractInfo = this.schemeToModify as ContractInfo;
      const schemeParametersHash = await this.modifiedSchemeConfiguration.getConfigurationHash(this.orgAddress);
      const permissions = await this.schemeService.getSchemePermissions(contractInfo.key);
      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(contractInfo.key);
      const fee = await this.schemeService.getSchemeFee(contractInfo.key);

      const tx = await scheme.proposeScheme(
        this.orgAddress,
        contractInfo.address,
        schemeParametersHash,
        (permissions & Permissions.CanRegisterOtherSchemes) != 0,
        nativeTokenAddress,
        fee,
        true);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.schemeToModify.name}`, tx.tx));
        
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted to add ${this.schemeToPropose.name}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async addScheme() {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");

      /**
       * STUCK HERE. CAN'T NECESSARILY KNOW WHAT THE SCHEME KEY IS IF IT ISN'T KNOW BY THE
       * CURRENT VERSION OR ARC.  COULD BE OLDER OR NEWER.  GOTTA MODIFY ARC SCHEMES SO  THEY
       * CAN IDENTIFY THEMSELVES. 
       */ 
      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(this.schemeToAddAddress);
      const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(this.orgAddress, this.upgradingSchemeAddress);
      const fee = await this.schemeService.getSchemeFee("UpgradeScheme", this.upgradingSchemeAddress);

      let tx = await upgradeSchemeToBeReplaced.proposeChangeUpgradingScheme(
        this.orgAddress,
        this.upgradingSchemeAddress,
        schemeParametersHash,
        nativeTokenAddress,
        fee);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to upgrading scheme', tx.tx));

      //   );
      //  this.eventAggregator.publish("handleSuccess", `Proposal submitted to change upgrading scheme to ${this.upgradingSchemeAddress}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       // this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }  
  }

  async removeScheme() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    const scheme = this.schemeToRemove;

    try {
      const tx = await schemeRegistrar.proposeToRemoveScheme(this.orgAddress, scheme.address);
      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.schemeToRemove.name}`, tx.tx));
        
       //this.eventAggregator.publish("handleSuccess", `Proposal submitted to remove ${this.schemeToRemove.name}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
      this.schemeToRemove = null;
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

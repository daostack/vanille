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
  hasSchemesToAdd: boolean;
  addableSchemes: Array<SchemeInfo> = [];
  addressControl: HTMLElement;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator

  ) {
    super();
  }

// activate() {
//   this.schemeService.getSchemesForDao(this.orgAddress, true).then((schemes) => {
//       this.hasSchemesToAdd = schemes.filter((s:SchemeInfo) => { return !s.inDao; }).length > 0;
//     });
// }

  useAddress() {
    if (this.currentSchemeSelection)
    {
      this.schemeToAddAddress = this.currentSchemeSelection.address;
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
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
        `Proposal submitted to modify ${this.schemeToModify.name}`, tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async addScheme() {
    try{
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");

      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(this.currentSchemeSelection.key, this.schemeToAddAddress);
      const fee = await this.schemeService.getSchemeFee(this.currentSchemeSelection.key, this.schemeToAddAddress);
      const schemeParametersHash = await this.newSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToAddAddress);
      const permissions = await this.schemeService.getSchemePermissions(this.currentSchemeSelection.key);

      let tx = await schemeRegistrar.proposeScheme(
        this.orgAddress,
        this.schemeToAddAddress,
        schemeParametersHash,
        (permissions & Permissions.CanRegisterOtherSchemes) != 0,
        nativeTokenAddress,
        fee,
        true);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.currentSchemeSelection.name}`, tx.tx));

      this.currentSchemeSelection = this.schemeToAddAddress = null; // reset so everything gets rebound properly
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

      this.schemeToRemove = null;
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

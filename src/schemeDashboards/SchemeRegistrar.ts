import { autoinject, computedFrom, observable } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import { OrganizationService } from '../services/OrganizationService';
import { ArcService, ContractInfo, SchemeRegistrar, ProposeToAddModifySchemeParams, ProposeToRemoveSchemeParams } from  "../services/ArcService";
import { Permissions } from '../services/ControllerService';
import { EventAggregator  } from 'aurelia-event-aggregator';
import { SchemeConfigurator} from '../schemeConfiguration/schemeConfigurationBase';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcSchemeItemName } from "../resources/customElements/arcSchemesDropdown/arcSchemesDropdown";
import { AureliaHelperService } from "../services/AureliaHelperService"
import { NULL_HASH } from '../services/Web3Service';

@autoinject
export class SchemeRegistrarDashboard extends DaoSchemeDashboard {

  modifiedSchemeConfiguration: SchemeConfigurator = <any>{};
  schemeToModify: SchemeInfo=null;
  schemeToRemove: SchemeInfo=null;
  newSchemeConfiguration: SchemeConfigurator = <any>{ canBeRegisteringScheme : true };
  @observable currentSchemeSelection: SchemeInfo=null;
  schemeToAddAddress: string;
  hasSchemesToAdd: boolean;
  addableSchemes: Array<SchemeInfo> = [];
  addressControl: HTMLElement;
  NonArcSchemeItemKey = NonArcSchemeItemName;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator
    , private aureliaHelperService: AureliaHelperService

  ) {
    super();
  }

  currentSchemeSelectionChanged() {
      this.schemeToAddAddress = undefined;
      $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
  }
  useAddress() {
    if (this.currentSchemeSelection)
    {
      this.schemeToAddAddress = this.currentSchemeSelection.address;
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
    }
  }

  @computedFrom("currentSchemeSelection")
  get isNonArcScheme() {
    return this.currentSchemeSelection && (this.currentSchemeSelection.name === NonArcSchemeItemName);
  }

  async addScheme() {
    try{
      
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrar;
      let config: ProposeToAddModifySchemeParams = Object.assign({
          avatar: this.orgAddress
          , scheme: this.schemeToAddAddress
          , schemeParametersHash: await this.newSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToAddAddress)
        }, this.newSchemeConfiguration);


      if (!this.isNonArcScheme) {
        config.schemeName = this.currentSchemeSelection.name;
      }
      
      let tx = await schemeRegistrar.proposeToAddModifyScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.currentSchemeSelection.friendlyName}`, tx.tx));

      this.currentSchemeSelection = this.schemeToAddAddress = null; // reset so everything gets rebound properly

    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error adding scheme ${this.schemeToAddAddress}`, ex));
    }  
  }

  async modifyScheme() {
  
    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrar;
      const schemeParametersHash = await this.modifiedSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToModify.address);

      const tx = await schemeRegistrar.proposeToAddModifyScheme({
        avatar: this.orgAddress,
        scheme: this.schemeToModify.address,
        schemeName: this.schemeToModify.name,
        schemeParametersHash: schemeParametersHash
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to modify ${this.schemeToModify.friendlyName}`, tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error modifying scheme ${this.schemeToModify.friendlyName}`, ex));
    }
  }

  async removeScheme() {

    try {

      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrar;

      let tx = await schemeRegistrar.proposeToRemoveScheme( {
        avatar: this.orgAddress,
        scheme: this.schemeToRemove.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.schemeToRemove.friendlyName}`, tx.tx));

      this.schemeToRemove = null;
    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error removing scheme ${this.schemeToRemove.address}`, ex));
    }
  }
}

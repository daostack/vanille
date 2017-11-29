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
import { NonArcSchemeItemKey } from "../resources/customElements/arcSchemesDropdown/arcSchemesDropdown";
import { AureliaHelperService } from "../services/AureliaHelperService"
import { NULL_HASH } from 'services/Web3Service';

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
  NonArcSchemeItemKey = NonArcSchemeItemKey;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator
    , private aureliaHelperService: AureliaHelperService

  ) {
    super();
  }

  attached() {
    this.aureliaHelperService.createPropertyWatch(this, "currentSchemeSelection", (newValue: SchemeInfo, oldValue: SchemeInfo) =>
    {
        this.schemeToAddAddress = undefined;
        $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
    });
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
    return this.currentSchemeSelection && (this.currentSchemeSelection.key === NonArcSchemeItemKey);
  }

  async modifyScheme() {
  
    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
      const schemeParametersHash = await this.modifiedSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToModify.address);

      const tx = await schemeRegistrar.proposeToAddModifyScheme({
        avatar: this.orgAddress,
        scheme: this.schemeToModify.address,
        schemeKey: this.schemeToModify.key,
        schemeParametersHash: schemeParametersHash
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to modify ${this.schemeToModify.name}`, tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async addScheme() {
    try{
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
      let tx;

      if (this.isNonArcScheme) {
        let config = this.newSchemeConfiguration as any;

        tx = await schemeRegistrar.proposeToAddModifyScheme({
          avatar: this.orgAddress,
          scheme: this.schemeToAddAddress,
          schemeKey: null,
          schemeParametersHash: config.schemeParametersHash,
          fee: config.fee,
          tokenAddress: config.tokenAddress,
          isRegistering: config.isRegistered
        });
      } else {
        const schemeParametersHash = await this.newSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToAddAddress);

        tx = await schemeRegistrar.proposeToAddModifyScheme({
          avatar: this.orgAddress,
          scheme: this.schemeToAddAddress,
          schemeKey: this.currentSchemeSelection.key,
          schemeParametersHash: schemeParametersHash
        });
      }

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.currentSchemeSelection.name}`, tx.tx));

      this.currentSchemeSelection = this.schemeToAddAddress = null; // reset so everything gets rebound properly

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }  
  }

  async removeScheme() {

    try {

      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");

      let tx = await schemeRegistrar.proposeToRemoveScheme( {
        avatar: this.orgAddress,
        scheme: this.schemeToRemove.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.schemeToRemove.name}`, tx.tx));

      this.schemeToRemove = null;
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

import { autoinject, computedFrom, observable } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from "../services/SchemeService";
import { DaoService } from '../services/DaoService';
import {
  ArcService
  , SchemeRegistrarWrapper
  , ProposeToAddModifySchemeParams
  , ProposeToRemoveSchemeParams,
  SchemePermissions,
  SchemeRegistrarParams,
  SchemeWrapper
} from "../services/ArcService";
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcSchemeItemName } from "../resources/customElements/arcSchemesDropdown/arcSchemesDropdown";
import { App } from '../app';
import { SchemeConfigModel } from '../schemeConfiguration/schemeConfigModel';

@autoinject
export class SchemeRegistrarDashboard extends DaoSchemeDashboard {

  modifiedSchemeConfiguration: Partial<SchemeConfigModel> = {};
  selectedSchemeToModify: SchemeInfo = null;
  selectedSchemeToRemove: SchemeInfo = null;
  newSchemeConfiguration: Partial<SchemeConfigModel> = {};
  @observable selectedSchemeToAdd: SchemeInfo = null;
  schemeToAddAddress: string;
  hasSchemesToAdd: boolean;
  addableSchemes: Array<SchemeInfo> = [];
  modifiableSchemes: Array<SchemeInfo> = [];
  removableSchemes: Array<SchemeInfo> = [];
  addressControl: HTMLElement;
  NonArcSchemeItemKey = NonArcSchemeItemName;

  constructor(
    private schemeService: SchemeService
    , private arcService: ArcService
    , private daoService: DaoService
    , private eventAggregator: EventAggregator
  ) {
    super();
  }

  async selectedSchemeToAddChanged() {
    if (this.selectedSchemeToAdd) {
      this.schemeToAddAddress = this.selectedSchemeToAdd.address;
    } else {
      this.schemeToAddAddress = undefined;
    }
    if (this.schemeToAddAddress) {
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
    } else {
      $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
    }
    if (this.schemeToAddAddress) {
      const wrapper: SchemeWrapper = (await this.arcService.contractWrapperFromAddress(this.schemeToAddAddress)) as any;
      /**
       * get the default permissions for the selected scheme
       */
      const schemePermissions = await wrapper.getDefaultPermissions();
      Object.assign(this.newSchemeConfiguration, { permissions: schemePermissions });
    } else {
      Object.assign(this.newSchemeConfiguration, { permissions: SchemePermissions.None });
    }
  }

  @computedFrom("selectedSchemeToAdd")
  get isNonArcScheme() {
    return this.selectedSchemeToAdd && (this.selectedSchemeToAdd.name === NonArcSchemeItemName);
  }

  @computedFrom("selectedSchemeToAdd")
  get isUnknownArcScheme() {
    return this.selectedSchemeToAdd && !App.hasDashboard(this.selectedSchemeToAdd.name);
  }

  @computedFrom("selectedSchemeToAdd")
  get addSchemeConfigView() {
    if (this.selectedSchemeToAdd) {
      let name = this.selectedSchemeToAdd.name;

      if (this.isUnknownArcScheme) {
        name = "UnknownArc";
      }

      return '../schemeConfiguration/' + name;
    } else {
      return undefined;
    }
  }


  async addScheme() {
    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrarWrapper;

      let config: ProposeToAddModifySchemeParams = Object.assign({
        avatar: this.orgAddress
        , schemeAddress: this.schemeToAddAddress
        , schemeParametersHash: await this.newSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToAddAddress)
      }, this.newSchemeConfiguration);

      if (!this.isNonArcScheme) {
        config.schemeName = this.selectedSchemeToAdd.name;
      }

      let result = await schemeRegistrar.proposeToAddModifyScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.schemeToAddAddress}`, result.tx.tx));

      this.selectedSchemeToAdd = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to add scheme ${this.schemeToAddAddress}`, ex));
    }
  }

  async modifyScheme() {
    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrarWrapper;

      let config: ProposeToAddModifySchemeParams = Object.assign({
        avatar: this.orgAddress
        , schemeName: this.selectedSchemeToModify.name // can only modify Arc schemes
        , schemeAddress: this.selectedSchemeToModify.address
        , schemeParametersHash: await this.modifiedSchemeConfiguration.getConfigurationHash(this.orgAddress, this.selectedSchemeToModify.address)
      }, this.modifiedSchemeConfiguration);

      // const schemeParams = await wrapper.getSchemeParameters(this.orgAddress);
      // const schemePermissions = await wrapper.getSchemePermissions(this.orgAddress);

      const result = await schemeRegistrar.proposeToAddModifyScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to modify ${this.selectedSchemeToModify.address}`, result.tx.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to modify scheme ${this.selectedSchemeToModify.address}`, ex));
    }
  }

  async removeScheme() {
    try {

      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrarWrapper;

      let result = await schemeRegistrar.proposeToRemoveScheme({
        avatar: this.orgAddress,
        schemeAddress: this.selectedSchemeToRemove.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.selectedSchemeToRemove.address}`, result.tx.tx));

      this.selectedSchemeToRemove = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to remove scheme ${this.selectedSchemeToRemove.address}`, ex));
    }
  }
}

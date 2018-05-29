import { autoinject, computedFrom, observable } from "aurelia-framework";
import { BindingSignaler } from 'aurelia-templating-resources';
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

  @observable selectedSchemeToAdd: SchemeInfo = null;
  @observable internalSelectedSchemeToModify: SchemeInfo = null;
  @observable selectedSchemeToModify: SchemeInfo = null;
  selectedSchemeToRemove: SchemeInfo = null;

  modifiedSchemeConfiguration: Partial<SchemeConfigModel> = {};
  newSchemeConfiguration: Partial<SchemeConfigModel> = {};

  modifiedSchemePermissions = SchemePermissions.None;
  newSchemePermissions = SchemePermissions.None;

  schemeToAddAddress: string;

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
    , private signaler: BindingSignaler
  ) {
    super();
  }

  async selectedSchemeToAddChanged() {
    if (this.selectedSchemeToAdd) {
      this.schemeToAddAddress = this.selectedSchemeToAdd.address;
    } else {
      this.schemeToAddAddress = null;
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
      this.newSchemePermissions = await wrapper.getDefaultPermissions();
    } else if (this.newSchemeConfiguration) {
      this.newSchemePermissions = SchemePermissions.None;
    }
  }

  async internalSelectedSchemeToModifyChanged() {
    if (this.internalSelectedSchemeToModify) {
      /**
       * get the current parameters values
       */
      const wrapper: SchemeWrapper = (await this.arcService.contractWrapperFromAddress(this.internalSelectedSchemeToModify.address)) as any;
      this.modifiedSchemePermissions = await wrapper.getSchemePermissions(this.orgAddress);

      const schemeParams = await wrapper.getSchemeParameters(this.orgAddress);
      Object.assign(this.modifiedSchemeConfiguration, schemeParams);
      // don't set this until everything is ready for it
      this.selectedSchemeToModify = this.internalSelectedSchemeToModify;
    } else if (this.modifiedSchemeConfiguration) {
      this.newSchemePermissions = SchemePermissions.None;
      this.selectedSchemeToModify = null;
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
        , permissions: this.newSchemePermissions
      }, this.newSchemeConfiguration);

      if (!this.isNonArcScheme) {
        config.schemeName = this.selectedSchemeToAdd.name;
      }

      let result = await schemeRegistrar.proposeToAddModifyScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.schemeToAddAddress}`, result.tx.tx));

      this.selectedSchemeToAdd = this.internalSelectedSchemeToModify = null;

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
        , permissions: this.modifiedSchemePermissions
      }, this.modifiedSchemeConfiguration);

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

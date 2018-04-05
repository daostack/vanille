import { autoinject, computedFrom, observable } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { SchemeService, SchemeInfo } from "../services/SchemeService";
import { DaoService } from '../services/DaoService';
import {
  ArcService
  , SchemeRegistrarWrapper
  , ProposeToAddModifySchemeParams
  , ProposeToRemoveSchemeParams
} from "../services/ArcService";
import { EventAggregator } from 'aurelia-event-aggregator';
import { SchemeConfigurator } from '../schemeConfiguration/schemeConfigurationBase';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcSchemeItemName } from "../resources/customElements/arcSchemesDropdown/arcSchemesDropdown";
import { App } from '../app';

@autoinject
export class SchemeRegistrarDashboard extends DaoSchemeDashboard {

  modifiedSchemeConfiguration: SchemeConfigurator = <any>{};
  schemeToModify: SchemeInfo = null;
  schemeToRemove: SchemeInfo = null;
  newSchemeConfiguration: SchemeConfigurator = <any>{ canBeRegisteringScheme: true };
  @observable currentSchemeSelection: SchemeInfo = null;
  schemeToAddAddress: string;
  hasSchemesToAdd: boolean;
  addableSchemes: Array<SchemeInfo> = [];
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

  currentSchemeSelectionChanged() {
    if (this.currentSchemeSelection) {
      this.schemeToAddAddress = this.currentSchemeSelection.address;
    } else {
      this.schemeToAddAddress = undefined;
    }
    if (this.schemeToAddAddress) {
      $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
    } else {
      $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
    }
  }

  @computedFrom("currentSchemeSelection")
  get isNonArcScheme() {
    return this.currentSchemeSelection && (this.currentSchemeSelection.name === NonArcSchemeItemName);
  }

  @computedFrom("currentSchemeSelection")
  get isUnknownArcScheme() {
    return this.currentSchemeSelection && !App.hasDashboard(this.currentSchemeSelection.name);
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
        config.schemeName = this.currentSchemeSelection.name;
      }

      let result = await schemeRegistrar.proposeToAddModifyScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to add ${this.schemeToAddAddress}`, result.tx.tx));

      this.currentSchemeSelection = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to add scheme ${this.schemeToAddAddress}`, ex));
    }
  }

  private getAddSchemeConfigView() {
    let name = this.currentSchemeSelection.name;

    if (this.isUnknownArcScheme) {
      name = "UnknownArc";
    }

    return '../schemeConfiguration/' + name;
  }
  async modifyScheme() {

    try {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrarWrapper;
      const schemeParametersHash = await this.modifiedSchemeConfiguration.getConfigurationHash(this.orgAddress, this.schemeToModify.address);

      const result = await schemeRegistrar.proposeToAddModifyScheme({
        avatar: this.orgAddress,
        schemeAddress: this.schemeToModify.address,
        schemeName: this.schemeToModify.name,
        schemeParametersHash: schemeParametersHash
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to modify ${this.schemeToModify.address}`, result.tx.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to modify scheme ${this.schemeToModify.address}`, ex));
    }
  }

  async removeScheme() {

    try {

      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar") as SchemeRegistrarWrapper;

      let result = await schemeRegistrar.proposeToRemoveScheme({
        avatar: this.orgAddress,
        schemeAddress: this.schemeToRemove.address
      });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Proposal submitted to remove ${this.schemeToRemove.address}`, result.tx.tx));

      this.schemeToRemove = null;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing to remove scheme ${this.schemeToRemove.address}`, ex));
    }
  }
}

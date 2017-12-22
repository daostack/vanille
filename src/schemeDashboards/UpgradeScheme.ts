import { autoinject, computedFrom, observable } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { SchemeService, SchemeInfo } from '../services/SchemeService';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { NonArcSchemeItemName } from "../resources/customElements/arcSchemesDropdown/arcSchemesDropdown";

@autoinject
export class UpgradeScheme extends DaoSchemeDashboard {

  controllerAddress: string;
  upgradingSchemeConfig:any = {};
  @observable currentSchemeSelection: SchemeInfo=null;
  upgradingSchemeAddress: string;
  NonArcSchemeItemKey = NonArcSchemeItemName;
  schemesExclusiveOfUpgradeScheme: Array<string>;
  addressControl: HTMLElement;
  schemeFees: any = { fee: 0, tokenAddress: undefined }

  constructor(
      private schemeService: SchemeService
    , private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
    this.schemesExclusiveOfUpgradeScheme =  arcService.arcSchemes
      .map((s) => s.name)
      .filter((name) => name !== "UpgradeScheme");
  }

  @computedFrom("currentSchemeSelection")
  get isNonArcScheme() {
    return this.currentSchemeSelection && (this.currentSchemeSelection.name === NonArcSchemeItemName);
  }

  currentSchemeSelectionChanged() {
      if (this.currentSchemeSelection)
      {
        this.upgradingSchemeAddress = this.currentSchemeSelection.address;
      } else {
        this.upgradingSchemeAddress = undefined;
      }
      if (this.upgradingSchemeAddress) {
        $(this.addressControl).addClass("is-filled"); // annoying thing you have to do for BMD
      } else {
        $(this.addressControl).removeClass("is-filled"); // annoying thing you have to do for BMD
      }
  }

  async proposeController() {
    try {
      const scheme = await this.arcService.getContract("UpgradeScheme");
      let tx = await scheme.proposeController(
        {
          avatar: this.orgAddress
          , controller: this.controllerAddress
        });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change controller ${this.controllerAddress}', tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing new controller ${this.controllerAddress}`, ex));
    }
  }

  async submitUpgradingScheme() {
    try {
      const scheme = await this.arcService.getContract("UpgradeScheme");
      let config:any = {
          avatar: this.orgAddress
        };

      config.scheme = this.upgradingSchemeAddress;
      
      config.schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(
        this.orgAddress, scheme.address);

      let tx = await scheme.proposeUpgradingScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change upgrading scheme ${this.upgradingSchemeAddress}', tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing new upgrade scheme ${this.upgradingSchemeAddress}`, ex));
    }
  }
}

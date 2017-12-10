import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { SchemeService, ContractInfo } from '../services/SchemeService';
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";

@autoinject
export class UpgradeScheme extends DaoSchemeDashboard {

  controllerAddress: string;
  upgradingSchemeConfig:any = {};
  upgradingSchemeAddress: string;
  nonArcScheme: boolean;

  constructor(
      private schemeService: SchemeService
    , private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
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
        'Proposal submitted to change controller', tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async submitUpgradingScheme() {
    try {
      const scheme = await this.arcService.getContract("UpgradeScheme");
      let config:any = {
          avatar: this.orgAddress
        };

      if (this.nonArcScheme) {
        config.scheme = this.upgradingSchemeAddress;
      } else {
        config.scheme = scheme.address;
      }
      
      config.schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(
        this.orgAddress, scheme.address);

      let tx = await scheme.proposeUpgradingScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change upgrading scheme', tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error proposing new upgrade scheme ${this.upgradingSchemeConfig.address}`, ex));
    }
  }
}

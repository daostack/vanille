import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { SchemeService, ContractInfo } from '../services/SchemeService';
import { EventConfigTransaction } from "../entities/GeneralEvents";

@autoinject
export class UpgradeScheme extends DaoSchemeDashboard {

  controllerAddress: string;
  upgradingSchemeConfig:any = {};
  upgradingSchemeAddress: string;
  upgradingSchemeTokenAddress: string;
  upgradingSchemeFee: Number;
  nonArcScheme: boolean;
  upgradingSchemeParametersHash: string;

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
        config.schemeParametersHash = this.upgradingSchemeParametersHash;
        config.fee = this.upgradingSchemeFee;
        config.tokenAddress = this.upgradingSchemeTokenAddress;
      } else {
        
        const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(
          this.orgAddress
          , scheme.address);

        config.scheme = scheme.address;
        config.schemeParametersHash = schemeParametersHash;
      }

      let tx = await scheme.proposeUpgradingScheme(config);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change upgrading scheme', tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

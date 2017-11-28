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
      const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(this.orgAddress, this.upgradingSchemeAddress);

      let tx = await scheme.proposeUpgradingScheme(
        {
          avatar: this.orgAddress
          , scheme: this.upgradingSchemeAddress
          , schemeParametersHash: schemeParametersHash
          // the controller needs to be apprised of how the UpgradeScheme will pay for stuff
          // , tokenAddress: tokenAddress
          // , fee: fee
        });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change upgrading scheme', tx.tx));

    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

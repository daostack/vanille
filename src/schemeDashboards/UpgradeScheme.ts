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
    // , private organizationService: OrganizationService
    , private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async proposeController() {
    try {
      const scheme = await this.arcService.getContract("UpgradeScheme");
      let tx = await scheme.proposeUpgrade(this.orgAddress, this.controllerAddress);
      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change controller', tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async submitUpgradingScheme() {
    try {
      const upgradeSchemeToBeReplaced = await this.arcService.getContract("UpgradeScheme");
      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken("UpgradeScheme", this.upgradingSchemeAddress);
      const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(this.orgAddress, this.upgradingSchemeAddress);
      const fee = await this.schemeService.getSchemeFee("UpgradeScheme", this.upgradingSchemeAddress);

      let tx = await upgradeSchemeToBeReplaced.proposeChangeUpgradingScheme(
        this.orgAddress,
        this.upgradingSchemeAddress,
        schemeParametersHash,
        nativeTokenAddress,
        fee);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to change upgrading scheme', tx.tx));
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

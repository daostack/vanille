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
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted to change controller to ${this.controllerAddress}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async submitUpgradingScheme() {
    try {
      const upgradeScheme = await this.arcService.getContract("UpgradeScheme");
      const contractInfo = this.arcService.contractInfoFromKey("UpgradeScheme");
      const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(contractInfo);
      const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(contractInfo, this.orgAddress);
      const fee = await this.schemeService.getSchemeFee(contractInfo);

      let tx = await upgradeScheme.proposeChangeUpgradingScheme(
        this.orgAddress,
        contractInfo.address,
        schemeParametersHash,
        nativeTokenAddress,
        fee);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        'Proposal submitted to upgrading scheme', tx.tx));

      //   );
      //  this.eventAggregator.publish("handleSuccess", `Proposal submitted to change upgrading scheme to ${this.upgradingSchemeAddress}`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       // this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

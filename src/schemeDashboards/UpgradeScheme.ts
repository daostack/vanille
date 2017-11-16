import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';
import { ArcService } from  "../services/ArcService";
import { SchemeService, ContractInfo } from '../services/SchemeService';

@autoinject
export class UpgradeScheme extends DaoSchemeDashboard {

  controllerAddress: string;
  upgradingSchemeAddress: string;
  upgradingSchemeConfig:any = {};
  upgradingSchemeFee:Number = 0;

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
       this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  async submitUpgradingScheme() {
    try {
      // const upgradeScheme = await this.arcService.getContract("UpgradeScheme");
      // const contractInfo = this.arcService.contractInfoFromKey("UpgradeScheme");
      // const nativeTokenAddress = await this.schemeService.getSchemeNativeToken(contractInfo);
      // const schemeParametersHash = await this.upgradingSchemeConfig.getConfigurationHash(contractInfo, this.orgAddress);

      // let tx = await upgradeScheme.proposeChangeUpgradingScheme(
      //   this.orgAddress,
      //   this.upgradingSchemeAddress,


      //   );
      //  this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

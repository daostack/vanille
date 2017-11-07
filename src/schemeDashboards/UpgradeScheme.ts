import { DaoSchemeDashboard } from "./schemeDashboard"

export class UpgradeScheme extends DaoSchemeDashboard {

  activate(model) {
    return super.activate(model);
  }

  controllerAddress: string;
  upgradingSchemeAddress: string;
  upgradingSchemeParams:any = {};
  upgradingSchemeFee:Number = 0;

  proposeController() {

  }

  submitUpgradingScheme() {

  }
}

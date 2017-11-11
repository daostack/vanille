import { DaoSchemeDashboard } from "./schemeDashboard"

export class SimpleContributionScheme extends DaoSchemeDashboard {

  nativeTokenReward: Number = 0;
  description: string;
  ethReward: Number = 0;
  externalTokenReward: Number = 0;
  externalTokenAddress: string;
  beneficiaryAddress: string;
  
  proposeContribution() {
    
  }
}

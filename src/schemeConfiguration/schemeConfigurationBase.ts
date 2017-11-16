import { ContractInfo } from  "../services/SchemeService";
// export class SchemeConfigurationBase implements SchemeConfigurator {
//   model: any;

//   activate(model) {
//     model.getConfigurationHash = this.getConfigurationHash.bind(this);
//     this.model = model;
//   }
// }

export interface SchemeConfigurator {
  /**
   * subclasses must implement this to return an object with properties that
   * Arc will map to parameters for the given scheme.
   */
  getConfigurationHash(scheme: ContractInfo, orgAddress: string): Promise<string>;
}

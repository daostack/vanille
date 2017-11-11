import { bindable } from 'aurelia-framework';
import { SchemeConfigurator} from './schemeConfigurationBase';
import { SchemeService, SchemeInfo } from '../services/SchemeService';

/**
 * NOT CURRENTLY IN USE, JUST HERE BECAUSE I WROTE IT ACCIDENTALLY AND IT MIGHT SOMEDAY BE USEFUL
 */
export class SchemeRegistrar implements SchemeConfigurator  {

  cap= 0;
  price= 0;
  startBlock= 0;
  endBlock= 0;
  beneficiary= null;
  admin= null;

  constructor(
    private schemeService: SchemeService
  ) {
  }

  activate(model) {
      model.getConfigurationHash = this.getConfigurationHash.bind(this);
  }

  async getConfigurationHash(scheme: SchemeInfo, orgAddress: string): Promise<any> {
    return await this.schemeService.setSchemeParameters(scheme, {
      cap: this.cap
      , price: this.price
      , startBlock: this.startBlock
      , endBlock: this.endBlock
      , beneficiary: this.beneficiary
      , admin: this.admin
    });
  }
}

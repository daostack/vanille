import { bindable } from 'aurelia-framework';
import { SchemeConfigurationBase } from './schemeConfigurationBase';

export class SchemeRegistrar extends SchemeConfigurationBase  {

  constructor() {
    super();
  }

  activate(model) {
    model.cap= 0;
    model.price= 0;
    model.startBlock= 0;
    model.endBlock= 0;
    model.beneficiary= null;
    model.admin= null;
    return super.activate(model);
  }
}

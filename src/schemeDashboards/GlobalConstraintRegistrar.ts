import { DaoSchemeDashboard } from "./schemeDashboard"

export class GlobalConstraintRegistrar extends DaoSchemeDashboard {

  activate(model) {
    return super.activate(model);
  }
  
  constraintToPropose: string;
  constraintToUnPropose: string;
  proposeParams: any = {};

  proposeConstraint() {

  }

  unProposeConstraint() {
    
  }
}

import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator  } from 'aurelia-event-aggregator';

@autoinject
export class GlobalConstraintRegistrar extends DaoSchemeDashboard {

  constraintToPropose: string;
  constraintToUnPropose: string;
  proposeConfiguration: any = {};

  constructor(
    // private schemeService: SchemeService
    // , private arcService: ArcService
    // , private organizationService: OrganizationService
    private eventAggregator: EventAggregator
  ) {
    super();
  }

  proposeConstraint() {
    try {
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }

  unProposeConstraint() {
    try {
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted`);
       // this.eventAggregator.publish("handleSuccess", `Proposal submitted, Id: ${this.arcService.getValueFromTransactionLog(tx,"_proposalId")}`);
       this.eventAggregator.publish("handleWarning", `Not Implemented`);
    } catch(ex) {
        this.eventAggregator.publish("handleException", ex);
    }
  }
}

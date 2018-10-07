import { autoinject } from 'aurelia-framework';
import { Locking4Reputation } from 'schemeDashboards/Locking4Reputation';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { ExternalLocking4ReputationWrapper } from '@daostack/arc.js';

@autoinject
export class ExternalLocking4ReputationDashboard extends Locking4Reputation {

  alreadyLocked: boolean;
  protected wrapper: ExternalLocking4ReputationWrapper;

  async activate(model: SchemeDashboardModel) {
    await super.activate(model);
    this.hasReleaseFunction = false;
    this.alreadyLocked = await this.wrapper.getAccountHasLocked(this.web3Service.defaultAccount);
  }

  protected async lock(): Promise<boolean> {
    const success = await super.lock();
    this.alreadyLocked = success;
    return success;
  }

}

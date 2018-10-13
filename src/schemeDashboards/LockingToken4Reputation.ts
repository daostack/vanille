import { autoinject } from 'aurelia-framework';
import { Address, LockingToken4ReputationWrapper } from "../services/ArcService";
import { Locking4Reputation } from 'schemeDashboards/Locking4Reputation';

@autoinject
export class LockingToken4Reputation extends Locking4Reputation {

  private tokenAddress: Address;
  protected wrapper: LockingToken4ReputationWrapper;

  protected async refresh() {
    await super.refresh();
    super.refreshing = true;
    this.tokenAddress = (await this.wrapper.getToken()).address;
    super.refreshing = false;
  }

  protected async lock(): Promise<boolean> {
    if (!(await this.getLockBlocker())) {

      const token = await this.wrapper.getToken();

      await (await token.approve({
        owner: this.lockModel.lockerAddress,
        amount: this.lockModel.amount,
        spender: this.wrapper.address
      })).watchForTxMined();

      return super.lock(true);
    }
    return false;
  }
}

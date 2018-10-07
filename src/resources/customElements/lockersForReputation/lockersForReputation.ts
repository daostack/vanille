import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { LockInfo, Address, LockerInfo, Locking4ReputationWrapper } from 'services/ArcService';
import { Web3Service, BigNumber } from 'services/Web3Service';

@autoinject
export class LockersForReputation {

  constructor(private web3Service: Web3Service) {
    this.currentAccount = web3Service.defaultAccount;
  }

  // _lockers: Array<LockerInfo>;
  currentAccount: Address;
  refreshingLockers: boolean = false;

  //@bindable({ defaultBindingMode: bindingMode.oneWay }) 
  lockers: Array<LockerInfo>;

  @bindable({ defaultBindingMode: bindingMode.oneTime }) release: ({ lock: LockInfo }) => Promise<boolean>;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) redeem: ({ lock: LockInfo }) => Promise<boolean>;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) wrapper: Locking4ReputationWrapper;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) noReleaseFunction?: boolean = false;

  async attached() {
    this.refreshLockers();
  }

  private async refreshLockers() {
    this.refreshingLockers = true;
    this.lockers = await this.wrapper.getLockers({
      filterObject: { fromBlock: 0 }
    });
    this.refreshingLockers = false;
  }

  private async getLocks(locker: LockerInfo): Promise<Array<LockInfo>> {

    const fetcher = (await this.wrapper.getLocks())(
      { _locker: locker.lockerAddress },
      { fromBlock: 0 });

    return (await fetcher.get())
      // because _locker isn't indexed
      .filter((li: LockInfo) => li.lockerAddress === locker.lockerAddress);
  }

  async _release(lock: { lock: LockInfo }) {
    await this.release(lock);
  }

  async _redeem(lock: { lock: LockInfo }) {

    const success = await this.redeem(lock);

    if (success) {
      const locker = this.getLockerInfo(lock.lock.lockerAddress);

      // locker.score = (await this.wrapper.getLockerInfo(lockInfo.lockerAddress)).score;
      locker.score = new BigNumber(0); // score always goes to zero after redeem, even if some amount is still unreleased
    }
  }

  protected getLockerInfo(lockerAddress: Address): LockerInfo {
    return this.lockers.filter((locker) => locker.lockerAddress === lockerAddress)[0];
  }

}

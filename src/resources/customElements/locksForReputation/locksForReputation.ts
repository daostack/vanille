import { autoinject, bindable, bindingMode } from "aurelia-framework";
import { LockInfo, Address, LockerInfo, Locking4ReputationWrapper } from 'services/ArcService';
import { Web3Service } from 'services/Web3Service';

@autoinject
export class LocksForReputation {

  constructor(private web3Service: Web3Service) {
    this.currentAccount = web3Service.defaultAccount;
  }

  _locks: Array<LockInfo>;

  currentAccount: Address;
  anyCanRelease: boolean;
  // anyCanRedeem: boolean;

  @bindable({ defaultBindingMode: bindingMode.oneWay }) locks: Promise<Array<LockInfo>>;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) release: ({ lock: LockInfo }) => Promise<boolean>;
  // @bindable({ defaultBindingMode: bindingMode.oneTime }) redeem: ({ lock: LockInfo }) => Promise<boolean>;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) wrapper: Locking4ReputationWrapper;
  @bindable({ defaultBindingMode: bindingMode.oneTime }) noReleaseFunction?: boolean = false;

  attached() {
    this.locksChanged(this.locks);
  }

  async locksChanged(newLocks: Promise<Array<LockInfo>>) {
    const _tmpLocks = await newLocks as Array<LockInfoX>;

    for (const lock of _tmpLocks) {
      //lock.canRedeem = await this.canRedeem(lock);
      lock.canRelease = await this.canRelease(lock);
    }
    this.anyCanRelease = _tmpLocks.filter((l: LockInfoX) => l.canRelease).length > 0;
    // this.anyCanRedeem = _tmpLocks.filter((l: LockInfoX) => l.canRedeem).length > 0;
    this._locks = _tmpLocks;
  }

  private async _release(lock: LockInfoX) {
    const success = await this.release({ lock });
    if (success) {
      lock.canRelease = false; // await this.canRelease(lock);
      lock.amount = (await this.wrapper.getLockInfo(lock.lockerAddress, lock.lockId)).amount;
    }
  }

  // private async _redeem(lock: LockInfoX) {
  //   const success = await this.redeem({ lock });
  //   if (success) {
  //     lock.canRedeem = false; // await this.canRedeem(lock);
  //   }
  // }

  private async canRelease(lock: LockInfo): Promise<boolean> {
    if (lock.lockerAddress !== this.web3Service.defaultAccount) {
      return false;
    }
    else {
      const errMsg = await this.wrapper.getReleaseBlocker(lock.lockerAddress, lock.lockId);
      return !errMsg;
    }
  }
  // private async canRedeem(lock: LockInfo): Promise<boolean> {
  //   if (lock.lockerAddress !== this.web3Service.defaultAccount) {
  //     return false;
  //   } else {
  //     const errMsg = await this.wrapper.getRedeemBlocker(lock.lockerAddress);
  //     return !errMsg;
  //   }
  // }
}

interface LockInfoX extends LockInfo {
  //canRedeem: boolean;
  canRelease: boolean;
}

import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, WrapperService, LockingOptions, LockerInfo, LockInfo, Locking4ReputationWrapper, Address } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException, EventConfigFailure } from "../entities/GeneralEvents";
import { BigNumber, Web3Service } from '../services/Web3Service';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { Utils } from 'services/utils';

@autoinject
export abstract class Locking4Reputation extends DaoSchemeDashboard {

  protected wrapper: Locking4ReputationWrapper;
  totalLocked: BigNumber;
  totalLockedLeft: BigNumber;
  totalScore: BigNumber;
  totalReputationRewardable: BigNumber;
  totalReputationRewardableLeft: BigNumber;
  lockingStartTime: Date;
  lockingEndTime: Date;
  lockingPeriodIsEnded: boolean;
  lockCount: number;
  refreshing: boolean = false;
  maxLockingPeriod: number;
  lockerInfo: LockerInfo;
  userAddress: Address;
  locks: Array<LockInfo>;
  get userScore(): number { return this.lockerInfo ? this.web3Service.fromWei(this.lockerInfo.score).toNumber() : 0; }

  lockModel: LockingOptions = {
    lockerAddress: undefined,
    amount: undefined,
    period: undefined
  }

  constructor(
    protected eventAggregator: EventAggregator
    , protected web3Service: Web3Service
  ) {
    super();
  }

  async activate(model: SchemeDashboardModel) {
    this.wrapper = await WrapperService.factories[model.name].at(model.address);
    this.userAddress = this.web3Service.defaultAccount;
    return this.refresh();
  }

  protected async refresh() {
    this.refreshing = true;
    this.totalLocked = await this.wrapper.getTotalLocked();
    this.totalLockedLeft = await this.wrapper.getTotalLockedLeft();
    this.totalScore = await this.wrapper.getTotalScore();
    this.totalReputationRewardable = await this.wrapper.getReputationReward();
    this.totalReputationRewardableLeft = await this.wrapper.getReputationRewardLeft();
    this.lockingStartTime = await this.wrapper.getLockingStartTime();
    this.lockingEndTime = await this.wrapper.getLockingEndTime();
    this.lockCount = await this.wrapper.getLockCount();
    const blockDate = await Utils.lastBlockDate(this.web3Service.web3);
    this.lockingPeriodIsEnded = blockDate > this.lockingEndTime;
    this.maxLockingPeriod = await this.wrapper.getMaxLockingPeriod();
    this.lockModel.lockerAddress = this.userAddress;
    this.lockerInfo = await this.getLockerInfo();
    this.refreshing = false;
    return this.getLocks();
  }

  protected async getLockBlocker(): Promise<boolean> {
    const reason = await this.wrapper.getLockBlocker(this.lockModel);

    if (reason) {
      this.eventAggregator.publish("handleFailure", new EventConfigFailure(`Can't lock: ${reason}`));
      return true;
    }

    return false;
  }

  protected async lock(alreadyCheckedForBlock: boolean = false): Promise<boolean> {

    if (!alreadyCheckedForBlock && (await this.getLockBlocker())) {
      return false;
    }

    try {

      let result = await (<any>this.wrapper).lock(this.lockModel);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `lock submitted for ${this.lockModel.lockerAddress}`, result.tx));

      return true;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error locking for ${this.lockModel.lockerAddress}`, ex));
    }

    return false;
  }

  protected async release(lock: { lock: LockInfo }): Promise<boolean> {
    const lockInfo = lock.lock;

    try {

      let result = await (<any>this.wrapper).release(lockInfo);

      lockInfo.amount = new BigNumber(0);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `lock released for ${lockInfo.lockerAddress}, lockId: ${lockInfo.lockId} `, result.tx));

      return true;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error releasing lock for ${lockInfo.lockerAddress}, lockId: ${lockInfo.lockId} `, ex));
    }
    return false;
  }

  protected async redeem(): Promise<boolean> {
    const lockInfo = { lockerAddress: this.userAddress } as LockInfo;

    try {

      let result = await this.wrapper.redeem(lockInfo);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Reputation redeemed for ${lockInfo.lockerAddress}`, result.tx));

      return true;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error redeeming reputation for ${lockInfo.lockerAddress}`, ex));
    }
    return false;
  }

  // DutchX: dupe'd this from LockersForReputation.  Refactor.
  private async getLocks(): Promise<void> {

    const fetcher = (await this.wrapper.getLocks())(
      { _locker: this.userAddress },
      { fromBlock: 0 });

    this.locks = (await fetcher.get())
      // because _locker isn't indexed
      .filter((li: LockInfo) => li.lockerAddress === this.userAddress);
  }

  private getLockerInfo(): Promise<LockerInfo> {
    return this.wrapper.getLockerInfo(this.userAddress);
  }
}

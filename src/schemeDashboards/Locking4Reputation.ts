import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, WrapperService, LockingOptions, LockerInfo, LockInfo, Locking4ReputationWrapper } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException, EventConfigFailure } from "../entities/GeneralEvents";
import { BigNumber, Web3Service } from '../services/Web3Service';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { Utils } from 'services/utils';

@autoinject
export abstract class Locking4Reputation extends DaoSchemeDashboard {

  protected wrapper: Locking4ReputationWrapper;
  protected hasReleaseFunction: boolean = true;
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

  lockModel: LockingOptions = {
    lockerAddress: undefined,
    amount: undefined,
    period: undefined
  }

  lockers: Array<LockerInfo> = [];

  constructor(
    protected eventAggregator: EventAggregator
    , protected web3Service: Web3Service
  ) {
    super();
  }

  async activate(model: SchemeDashboardModel) {
    this.wrapper = await WrapperService.factories[model.name].at(model.address);
    await this.refresh();
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
    this.lockModel.lockerAddress = this.web3Service.defaultAccount;
    this.refreshing = false;
  }

  protected async getLockBlocker(): Promise<boolean> {
    const reason = await this.wrapper.getLockBlocker(this.lockModel);

    if (reason) {
      this.eventAggregator.publish("handleFailure", new EventConfigFailure(`Can't lock: ${reason}`));
      return true;
    }

    return false;
  }

  protected async lock(): Promise<boolean> {

    if (!(await this.getLockBlocker())) {
      try {

        let result = await (<any>this.wrapper).lock(this.lockModel);

        this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
          `lock submitted for ${this.lockModel.lockerAddress}`, result.tx));

        return true;

      } catch (ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error locking for ${this.lockModel.lockerAddress}`, ex));
      }
    }
    return false;
  }

  protected async release(lock: { lock: LockInfo }): Promise<boolean> {
    const lockInfo = lock.lock;

    try {

      if (!this.hasReleaseFunction) {
        throw new Error("this contract does not support releasing");
      }

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

  protected async redeem(lock: { lock: LockInfo }): Promise<boolean> {
    const lockInfo = lock.lock;

    try {

      let result = await this.wrapper.redeem(lockInfo);

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Reputation redeemed for ${lockInfo.lockerAddress}, lockId: ${lockInfo.lockId} `, result.tx));

      return true;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error redeeming reputation for ${lockInfo.lockerAddress}, lockId: ${lockInfo.lockId} `, ex));
    }
    return false;
  }
}

import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { WrapperService, Address, Auction4ReputationWrapper, StandardTokenWrapper } from "../services/ArcService";
import { BigNumber, Web3Service } from '../services/Web3Service';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { EventConfigTransaction, EventConfigException, EventConfigFailure } from 'entities/GeneralEvents';
import { Utils } from 'services/utils';

@autoinject
export class Auction4Reputation extends DaoSchemeDashboard {

  protected wrapper: Auction4ReputationWrapper;
  auctionPeriod: number;
  totalReputationRewardable: BigNumber;
  totalReputationRewardableLeft: BigNumber;
  auctionsStartTime: Date;
  auctionsEndTime: Date;
  numberOfAuctions: number;
  auctionReputationReward: BigNumber;
  walletAddress: Address;
  token: StandardTokenWrapper;
  auctionId: number = -1;
  auctionIsOver: boolean;
  userHasBid: boolean = false;
  refreshing: boolean = false;
  refreshingLockers: boolean = false;

  constructor(
    protected eventAggregator: EventAggregator
    , protected web3Service: Web3Service
  ) {
    super();
  }

  async activate(model: SchemeDashboardModel) {
    this.wrapper = await WrapperService.factories[model.name].at(model.address);
    return this.refresh();
  }

  protected async refresh() {
    this.refreshing = true;
    this.token = await this.wrapper.getToken();
    this.walletAddress = await this.wrapper.getWallet();
    this.auctionPeriod = await this.wrapper.getAuctionPeriod();
    this.totalReputationRewardable = await this.wrapper.getReputationReward();
    this.totalReputationRewardableLeft = await this.wrapper.getReputationRewardLeft();
    this.auctionsStartTime = await this.wrapper.getAuctionsStartTime();
    this.auctionsEndTime = await this.wrapper.getAuctionsEndTime();
    // this.numberOfAuctions = await this.wrapper.getNumberOfAuctions();
    this.auctionIsOver = (await Utils.lastBlockDate(this.web3Service.web3)) >= this.auctionsEndTime;
    this.refreshing = false;
  }

  protected async bid(amount: BigNumber): Promise<void> {

    const currentAccount = this.web3Service.defaultAccount;

    try {

      const reason = await this.wrapper.getBidBlocker({ amount });

      if (reason) {
        this.eventAggregator.publish("handleFailure", new EventConfigFailure(`Can't bid: ${reason}`));
        return;
      }

      await (await this.token.approve({
        owner: currentAccount,
        amount: amount,
        spender: this.wrapper.address
      })).watchForTxMined();

      let result = await this.wrapper.bid({ amount });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `bid ${this.web3Service.fromWei(amount)} token(s), for: ${currentAccount}`, result.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error bidding ${this.web3Service.fromWei(amount)} token(s), for: ${currentAccount}`, ex));
    }
  }

  protected async redeem(auctionId: number, beneficiaryAddress: Address) {

    /**
     * TODO!!!:  will there be a problem with timezones here???
     * Should get this id from Arc, see: https://github.com/daostack/arc/issues/548
     * In any case, it can't be replired-upon that the current auction will not have changed between now and when
     * execution actually reached the contract.
     */
    // const currentAuctionId = Math.floor((Date.now() - this.auctionsStartTime.getTime()) / 1000 / this.auctionPeriod);
    // const amountMayRedeem = await this.wrapper.getBid(beneficiaryAddress, currentAuctionId);

    try {

      let result = await this.wrapper.redeem({ auctionId, beneficiaryAddress });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Redeemed in auctionId ${auctionId}, for: ${beneficiaryAddress}`, result.tx));

      this.auctionId = -1;

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error redeeming in auctionId ${auctionId}, for: ${beneficiaryAddress}`, ex));
    }
  }

  async _userHasBid(auctionId: number): Promise<void> {
    this.userHasBid = (await this.wrapper.getBid(this.web3Service.defaultAccount, auctionId)).gt(0);
  }

  private setAuctionId(auctionId: number): void {
    this.auctionId = auctionId;
    this._userHasBid(auctionId);
  }
}
